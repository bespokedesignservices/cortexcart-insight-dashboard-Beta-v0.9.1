'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '@/app/components/Layout';
import { SparklesIcon, CalendarIcon, InformationCircleIcon, PaperAirplaneIcon, ClipboardDocumentIcon, ChartBarIcon, PencilSquareIcon, CheckIcon, XCircleIcon } from '@heroicons/react/24/solid';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import ImageManager from '@/app/components/ImageManager';
import SalesBarChart from '@/app/components/SalesBarChart';
import Ga4LineChart from '@/app/components/Ga4LineChart';
import AnalyticsChart from '@/app/components/AnalyticsChart';
import { DndContext, DragOverlay, useDroppable, pointerWithin } from '@dnd-kit/core';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';

// Register Chart.js and set up calendar localizer
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);
const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(Calendar);

// --- PLATFORMS CONFIGURATION ---
const PLATFORMS = {
    x: { name: 'X (Twitter)', maxLength: 280, icon: (props) => (<svg {...props} viewBox="0 0 1200 1227"><path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" fill="currentColor"/></svg>), placeholder: 'What&apos;s happening?!', disabled: false },
    pinterest: { name: 'Pinterest', maxLength: 500, icon: (props) => (<svg {...props} viewBox="0 0 24 24"><path fill="#E60023" d="M12 2C6.477 2 2 6.477 2 12c0 4.14 2.686 7.66 6.357 8.94.02-.19.03-.4.05-.61l.33-1.4a.12.12 0 0 1 .1-.1c.36-.18 1.15-.56 1.15-.56s-.3-.91-.25-1.79c.06-.9.65-2.12 1.46-2.12.68 0 1.2.51 1.2 1.12 0 .68-.43 1.7-.65 2.64-.18.78.38 1.42.92 1.42 1.58 0 2.63-2.1 2.63-4.22 0-1.8-.95-3.26-2.7-3.26-2.12 0-3.32 1.58-3.32 3.16 0 .6.22 1.25.5 1.62.03.04.04.05.02.13l-.15.65c-.05.2-.14.24-.32.08-1.05-.9-1.5-2.3-1.5-3.82 0-2.78 2.04-5.38 5.8-5.38 3.1 0 5.2 2.25 5.2 4.67 0 3.1-1.95 5.42-4.62 5.42-.9 0-1.75-.46-2.05-1l-.52 2.1c-.24 1-.92 2.25-.92 2.25s-.28.1-.32.08c-.46-.38-.68-1.2-.55-1.88l.38-1.68c.12-.55-.03-1.2-.5-1.52-1.32-.9-1.9-2.6-1.9-4.22 0-2.28 1.6-4.3 4.6-4.3 2.5 0 4.2 1.8 4.2 4.15 0 2.5-1.55 4.5-3.8 4.5-.75 0-1.45-.38-1.7-.82l-.28-.9c-.1-.4-.2-.8-.2-1.22 0-.9.42-1.68 1.12-1.68.9 0 1.5.8 1.5 1.88 0 .8-.25 1.88-.58 2.8-.25.7-.5 1.4-.5 1.4s-.3.12-.35.1c-.2-.1-.3-.2-.3-.4l.02-1.12z"/></svg>), placeholder: 'Add a Pin description...', disabled: false },
};

const SocialNav = ({ activeTab, setActiveTab }) => {
    const tabs = [{ name: 'Composer', icon: PencilSquareIcon }, { name: 'Analytics', icon: ChartBarIcon }, { name: 'Schedule', icon: CalendarIcon }];
    return (
        <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => (
                    <button key={tab.name} onClick={() => setActiveTab(tab.name)}
                        className={`whitespace-nowrap flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.name ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        <tab.icon className="mr-2 h-5 w-5" /> {tab.name}
                    </button>
                ))}
            </nav>
        </div>
    );
};

const ComposerTabContent = ({ onPostScheduled, scheduledPosts, postContent, setPostContent, selectedPlatform, setSelectedPlatform }) => {
    const [postImages, setPostImages] = useState([]);
    const [topic, setTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const [userImages, setUserImages] = useState([]);
    const [scheduleDate, setScheduleDate] = useState(moment().add(1, 'day').format('YYYY-MM-DD'));
    const [scheduleTime, setScheduleTime] = useState('10:00');
    const [isLoadingImages, setIsLoadingImages] = useState(true);
    const [activeDragId, setActiveDragId] = useState(null);

    useEffect(() => {
        fetch('/api/images').then(res => res.json()).then(setUserImages).finally(() => setIsLoadingImages(false));
    }, []);

    const { setNodeRef } = useDroppable({ id: 'post-composition-area' });
    const handleDragStart = (event) => setActiveDragId(event.active.id);
    const handleDragEnd = (event) => { /* ... existing logic ... */ };
    const handleRemoveImage = (imageId) => setPostImages(current => current.filter(image => image.id !== imageId));

    const currentPlatform = PLATFORMS[selectedPlatform];

    const handleSchedulePost = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const scheduledAt = moment(`${scheduleDate}T${scheduleTime}`).toISOString();
            if (moment(scheduledAt).isBefore(moment())) {
                throw new Error('You cannot schedule a post in the past.');
            }

            const response = await fetch('/api/social/schedule/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    platform: selectedPlatform,
                    content: postContent,
                    hashtags: [], // Assuming no hashtags for now
                    scheduledAt: scheduledAt,
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to schedule the post.');
            }
            onPostScheduled(); // Refresh scheduled posts
        } catch (err) { setError(err.message); }
    };
    const isOverLimit = postContent.length > currentPlatform.maxLength;

    return (
        <>
            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={pointerWithin}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md border">
                        {/* Platform Selector, Image Drop Area, Text Area... */}
                        <div className="flex items-center border-b pb-4 overflow-x-auto whitespace-nowrap">
                            {Object.keys(PLATFORMS).map(key => {
                                const Icon = PLATFORMS[key].icon;
                                return (
                                    <button key={key} onClick={() => setSelectedPlatform(key)} className={`flex items-center px-4 py-2 text-sm font-medium rounded-md mr-2 ${selectedPlatform === key ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                                        {Icon && <Icon className="h-5 w-5 mr-2" />} {PLATFORMS[key].name}
                                    </button>
                                );
                            })}
                        </div>
                        <div ref={setNodeRef} className="mt-4 p-2 border-2 border-dashed rounded-lg min-h-[120px] flex items-center justify-center bg-gray-50 flex-wrap gap-2">
                             {postImages.map(image => (
                                <div key={image.id} className="relative w-24 h-24">
                                    <img src={image.image_url} alt="Post preview" className="w-full h-full object-cover rounded-md" />
                                    <button onClick={() => handleRemoveImage(image.id)} className="absolute -top-2 -right-2 bg-gray-700 text-white rounded-full p-0.5 hover:bg-red-600"><XCircleIcon className="h-5 w-5" /></button>
                                </div>
                            ))}
                        </div>
                        <textarea value={postContent} onChange={(e) => setPostContent(e.target.value)} placeholder={currentPlatform.placeholder} className="mt-4 w-full h-64 p-4 border border-gray-200 rounded-md"/>
                        <div className="mt-4 flex justify-between items-center">
                            <span className={`text-sm font-medium ${isOverLimit ? 'text-red-600' : 'text-gray-500'}`}>{postContent.length}/{currentPlatform.maxLength}</span>
                            <div className="flex items-center gap-x-2">
                                <button onClick={() => { }} className="flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm bg-white text-gray-700 border-gray-300 hover:bg-gray-50"><ClipboardDocumentIcon className="h-5 w-5 mr-2" />Copy</button>
                                <button onClick={() => { }} className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"><PaperAirplaneIcon className="h-5 w-5 mr-2" />Post Now</button>
                            </div>
                        </div>
                        {/* New Form for Scheduling */}
                        <form onSubmit={handleSchedulePost} className="mt-6 border-t pt-4">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Schedule Post</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="scheduleDate" className="block text-sm font-medium text-gray-700">Date</label>
                                    <input
                                        type="date"
                                        id="scheduleDate"
                                        name="scheduleDate"
                                        onChange={(e) => setScheduleDate(e.target.value)}
                                        value={scheduleDate}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="scheduleTime" className="block text-sm font-medium text-gray-700">Time</label>
                                    <input
                                        type="time"
                                        id="scheduleTime"
                                        name="scheduleTime"
                                        value={scheduleTime}
                                        onChange={(e) => setScheduleTime(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                            <div className="mt-6">
                                <button type="submit" disabled={!postContent || isOverLimit || !scheduleDate || !scheduleTime} className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400">
                                    <CalendarIcon className="h-5 w-5 mr-2" />Schedule Post
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white p-6 rounded-lg shadow-md border space-y-4">
                            <h3 className="font-semibold text-lg">AI Assistant</h3>
                            <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., 'New Summer T-Shirt Sale'" className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm"/>
                            <button disabled={isGenerating || !topic.trim()} className="w-full flex items-center justify-center px-4 py-2 border rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400">
                                <SparklesIcon className="h-5 w-5 mr-2" />{isGenerating ? 'Generating...' : 'Generate with AI'}
                            </button>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md border">
                            <h3 className="font-semibold text-lg mb-4">Upcoming Posts</h3>
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {scheduledPosts.length > 0 ? scheduledPosts.slice(0, 5).map(post => (
                                    <div key={post.id} className="text-sm p-2 bg-gray-50 rounded-md">
                                        <p className="font-semibold">{PLATFORMS[post.platform]?.name}</p>
                                        <p className="text-gray-600 truncate">{post.content}</p>
                                        <p className="text-xs text-blue-500 mt-1">{moment(post.scheduled_at).format('MMM D, h:mm a')}</p>
                                    </div>
                                )) : <p className="text-sm text-center text-gray-500 py-4">No posts scheduled.</p>}
                            </div>
                        </div>
                    </div>
                </div>
                <ImageManager images={userImages} isLoading={isLoadingImages} />
                <DragOverlay>{activeDragId && <div className="w-24 h-24 bg-gray-300 rounded-md shadow-lg" />}</DragOverlay>
            </DndContext>
        </>
    );
};

const AnalyticsTabContent = () => {
    // Dummy data for analytics
    const dummyAnalyticsData = {
        totalPosts: 125,
        totalReach: '1.2M',
        engagementRate: '5.2%',
        topPerformingPost: {
            id: 1,
            content: 'Our new summer collection is here! Shop now...',
            platform: 'pinterest',
            reach: '250K',
            engagement: '8.1%',
            image: '/images/dummy-product-1.jpg'
        },
        platformBreakdown: [
            { platform: 'x', posts: 50, reach: '500K', engagement: '4.5%' },
            { platform: 'pinterest', posts: 40, reach: '400K', engagement: '6.0%' },
            { platform: 'facebook', posts: 35, reach: '300K', engagement: '5.0%' },
        ],
        dailyReach: [
            { date: '2023-10-26', reach: 15000 },
            { date: '2023-10-27', reach: 17000 },
            { date: '2023-10-28', reach: 20000 },
            { date: '2023-10-29', reach: 18000 },
            { date: '2023-10-30', reach: 22000 },
            { date: '2023-10-31', reach: 25000 },
            { date: '2023-11-01', reach: 23000 },
        ],
        engagementByPlatform: {
            labels: ['X (Twitter)', 'Pinterest', 'Facebook'],
            datasets: [
                {
                    label: 'Engagement Rate (%)',
                    data: [4.5, 6.0, 5.0],
                    backgroundColor: [
                        'rgba(29, 161, 242, 0.7)', // X Blue
                        'rgba(230, 0, 35, 0.7)', // Pinterest Red
                        'rgba(24, 119, 242, 0.7)', // Facebook Blue
                    ],
                    borderColor: [
                        'rgba(29, 161, 242, 1)', 'rgba(230, 0, 35, 1)', 'rgba(24, 119, 242, 1)',
                    ],
                    borderWidth: 1,
                },
            ],
        },
    };

    return ( 
        <div className="bg-white p-6 rounded-lg shadow-md border">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Social Media Analytics Overview</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 p-5 rounded-lg shadow-sm">
                    <p className="text-sm font-medium text-blue-600">Total Posts</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{dummyAnalyticsData.totalPosts}</p>
                </div>
                <div className="bg-green-50 p-5 rounded-lg shadow-sm">
                    <p className="text-sm font-medium text-green-600">Total Reach</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{dummyAnalyticsData.totalReach}</p>
                </div>
                <div className="bg-purple-50 p-5 rounded-lg shadow-sm">
                    <p className="text-sm font-medium text-purple-600">Engagement Rate</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{dummyAnalyticsData.engagementRate}</p>
                </div>
            </div>

            {/* Line Chart for Daily Reach */}
            <div className="mb-8">
                <h4 className="text-xl font-semibold text-gray-800 mb-4">Daily Reach Over Time</h4>
                <div className="h-80">
                    <Ga4LineChart data={dummyAnalyticsData.dailyReach.map(item => ({
                        date: item.date,
                        pageviews: item.reach, // Re-using pageviews for reach
                        conversions: 0 // No conversions in this dummy data
                    }))} />
                </div>
            </div>

            {/* Bar Chart for Platform Breakdown (Posts) */}
            <div className="mb-8">
                <h4 className="text-xl font-semibold text-gray-800 mb-4">Posts by Platform</h4>
                <div className="h-80">
                    <SalesBarChart apiData={dummyAnalyticsData.platformBreakdown.map(item => ({
                        date: item.platform, // Re-using date for platform name
                        total_sales: item.posts // Re-using total_sales for posts count
                    }))} currencySymbol="" locale="en-US" />
                </div>
            </div>

            {/* Doughnut Chart for Engagement by Platform */}
            <div className="mb-8">
                <h4 className="text-xl font-semibold text-gray-800 mb-4">Engagement Rate by Platform</h4>
                <div className="h-80 flex justify-center items-center">
                    <div className="w-full max-w-md">
                        <AnalyticsChart data={dummyAnalyticsData.engagementByPlatform} options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'right',
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function(context) {
                                            let label = context.label || '';
                                            if (label) {
                                                label += ': ';
                                            }
                                            if (context.parsed !== null) {
                                                label += context.parsed + '%';
                                            }
                                            return label;
                                        }
                                    }
                                }
                            },
                        }} />
                    </div>
                </div>
            </div>
        </div>
    );
};
// --- NEW: Custom component to render events in the calendar ---//
const CustomEvent = ({ event }) => {
    return (
        <div className="flex flex-col text-xs">
            <strong className="font-semibold">{moment(event.start).format('h:mm a')}</strong>
            <span className="truncate">{event.title}</span>
        </div>
    );
};

const ScheduleTabContent = ({ scheduledPosts, setScheduledPosts, fetchScheduledPosts, calendarDate, setCalendarDate, view, setView, newView }) => {
    const eventPropGetter = useCallback(
        (event) => {
            const platform = event.resource?.platform;
            let style = {
                borderRadius: '5px',
                border: 'none',
                color: 'white',
                display: 'block'
            };
            if (platform === 'x') {
                style.backgroundColor = '#1DA1F2'; // Twitter Blue
            } else if (platform === 'pinterest') {
                style.backgroundColor = '#E60023'; // Pinterest Red
            } else {
                style.backgroundColor = '#6B7280'; // Gray
            }
            return { style };
        },
        []
    );

    const onEventDrop = useCallback(async ({ event, start }) => {
       if (moment(start).isBefore(moment())) {
            alert("Cannot move events to a past date.");
            return;
       }
        const originalEvents = [...scheduledPosts];
        const updatedEvents = scheduledPosts.map(e => 
            e.id === event.id ? { ...e, start, end: moment(start).add(1, 'hour').toDate() } : e
        );
        setScheduledPosts(updatedEvents);

        try {
            const res = await fetch(`/api/social/schedule/${event.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scheduled_at: start.toISOString() }),
            });
            if (!res.ok) throw new Error('Failed to update on server');
        } catch (error) {
            console.error("Failed to update schedule:", error);
            alert('Failed to update schedule. Reverting changes.');
            setScheduledPosts(originalEvents);
        }
    }, [scheduledPosts, setScheduledPosts, fetchScheduledPosts]);

    // --- NEW: Function to style past dates ---
    const dayPropGetter = useCallback((date) => {
        if (moment(date).isBefore(moment(), 'day')) {
            return {
                className: 'rbc-off-range-bg-disabled',
                style: {
                    backgroundColor: '#f3f4f6', // A light gray color
                    cursor: 'not-allowed',
                },
            };
        }
        return {};
    }, []);

    // Handle the nav buttons on the calendar
    const handleNavigate = (newDate) => {
        setCalendarDate(newDate);
    };
    // Handle the view tabs of calender
       const handleView = (newView) => setView(newView);
        // If the user clicks the "Day" button, set the calendar to tomorrow's date
        if (newView === 'day') {
            setCalendarDate(moment().add(1, 'day').toDate());
        };

    return (
        <>
        <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800 rounded-r-lg">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <InformationCircleIcon className="h-5 w-5 text-blue-500" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm">
                            You can drag and drop scheduled posts to new dates to quickly reschedule them.
                        </p>
                    </div>
                </div>
            </div>
            
        <div className="bg-white p-6 rounded-lg shadow-md border" style={{ height: '80vh' }}>
            <DragAndDropCalendar
                localizer={localizer}
                events={scheduledPosts}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                resizable
                dayPropGetter={dayPropGetter} // <-- Apply the new day styler
                eventPropGetter={eventPropGetter}
                onEventDrop={onEventDrop} // Add this for drag and drop functionality
                views={['month', 'week', 'day']}
                components={{
                    event: CustomEvent, // Use our custom component for events
                }}
                date={calendarDate}
                onNavigate={handleNavigate}
                view={view}
                onView={handleView}
            />
        </div>
        </>
    );
};

export default function SocialMediaManagerPage() {
    const { status } = useSession();
    const [activeTab, setActiveTab] = useState('Composer');
    const [scheduledPosts, setScheduledPosts] = useState([]);
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [view, setView] = useState(Views.MONTH); // Default view is Month
    // Lifted State
    const [postContent, setPostContent] = useState('');
    const [selectedPlatform, setSelectedPlatform] = useState('x');

    const fetchScheduledPosts = useCallback(async () => {
        try {
            const res = await fetch('/api/social/schedule');
            const data = await res.json();
            const formattedEvents = data.map(post => ({
                id: post.id,
                title: `${PLATFORMS[post.platform]?.name || 'Post'}: ${post.content.substring(0, 30)}...`,
                start: new Date(post.scheduled_at),
                end: moment(post.scheduled_at).add(1, 'hour').toDate(),
                resource: { platform: post.platform },
            }));
            setScheduledPosts(formattedEvents);
        } catch (error) { console.error("Failed to fetch posts:", error); }
    }, []);

    useEffect(() => {
        if (status === 'authenticated') fetchScheduledPosts();
    }, [status, fetchScheduledPosts]);
    
    if (status === 'loading') return <Layout><p>Loading...</p></Layout>;

    return (
        <Layout>
            <div className="mb-8">
                <h2 className="text-3xl font-bold">Social Media Manager</h2>
                <p className="mt-1 text-sm text-gray-500">Design, schedule, and analyze your social media content.</p>
            </div>
            <SocialNav activeTab={activeTab} setActiveTab={setActiveTab} />
            
            {activeTab === 'Composer' && (
                <ComposerTabContent
                    onPostScheduled={fetchScheduledPosts}
                    scheduledPosts={scheduledPosts}
                    postContent={postContent}
                    setPostContent={setPostContent} // Pass setPostContent
                    selectedPlatform={selectedPlatform}
                    setSelectedPlatform={setSelectedPlatform}
                />
            )}
            {activeTab === 'Analytics' && <AnalyticsTabContent />}
            {activeTab === 'Schedule' && (
                <ScheduleTabContent 
                    scheduledPosts={scheduledPosts} 
                    setScheduledPosts={setScheduledPosts} 
                    fetchScheduledPosts={fetchScheduledPosts}
                    calendarDate={calendarDate}
                    setCalendarDate={setCalendarDate}
                    view={view}
                    setView={setView}
                />
            )}
            
            
        </Layout>
    );
}