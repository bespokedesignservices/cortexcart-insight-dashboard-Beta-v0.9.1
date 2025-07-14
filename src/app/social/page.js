'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, getSession } from 'next-auth/react';
import Layout from '@/app/components/Layout';
import { SparklesIcon, CalendarIcon, PaperAirplaneIcon, InformationCircleIcon, CakeIcon, UserIcon, GlobeAltIcon, ClipboardDocumentIcon, ChartBarIcon, PencilSquareIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import ImageManager from '@/app/components/ImageManager';
import SalesBarChart from '@/app/components/SalesBarChart';
import Ga4LineChart from '@/app/components/Ga4LineChart';
import AnalyticsChart from '@/app/components/AnalyticsChart';
import { DndContext, DragOverlay, useDroppable, pointerWithin } from '@dnd-kit/core';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';

// Register Chart.js and set up calendar localizer
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);
const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(Calendar);

// --- PLATFORMS CONFIGURATION ---
const PLATFORMS = {
    x: { name: 'X (Twitter)', maxLength: 280, icon: (props) => (<svg {...props} viewBox="0 0 1200 1227"><path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" fill="currentColor"/></svg>), placeholder: 'Whats happening?!', disabled: false },
    pinterest: { name: 'Pinterest', maxLength: 500, icon: (props) => (<svg {...props} viewBox="0 0 24 24"><path fill="#E60023" d="M12 2C6.477 2 2 6.477 2 12c0 4.14 2.686 7.66 6.357 8.94.02-.19.03-.4.05-.61l.33-1.4a.12.12 0 0 1 .1-.1c.36-.18 1.15-.56 1.15-.56s-.3-.91-.25-1.79c.06-.9.65-2.12 1.46-2.12.68 0 1.2.51 1.2 1.12 0 .68-.43 1.7-.65 2.64-.18.78.38 1.42.92 1.42 1.58 0 2.63-2.1 2.63-4.22 0-1.8-.95-3.26-2.7-3.26-2.12 0-3.32 1.58-3.32 3.16 0 .6.22 1.25.5 1.62.03.04.04.05.02.13l-.15.65c-.05.2-.14.24-.32.08-1.05-.9-1.5-2.3-1.5-3.82 0-2.78 2.04-5.38 5.8-5.38 3.1 0 5.2 2.25 5.2 4.67 0 3.1-1.95 5.42-4.62 5.42-.9 0-1.75-.46-2.05-1l-.52 2.1c-.24 1-.92 2.25-.92 2.25s-.28.1-.32.08c-.46-.38-.68-1.2-.55-1.88l.38-1.68c.12-.55-.03-1.2-.5-1.52-1.32-.9-1.9-2.6-1.9-4.22 0-2.28 1.6-4.3 4.6-4.3 2.5 0 4.2 1.8 4.2 4.15 0 2.5-1.55 4.5-3.8 4.5-.75 0-1.45-.38-1.7-.82l-.28-.9c-.1-.4-.2-.8-.2-1.22 0-.9.42-1.68 1.12-1.68.9 0 1.5.8 1.5 1.88 0 .8-.25 1.88-.58 2.8-.25.7-.5 1.4-.5 1.4s-.3.12-.35.1c-.2-.1-.3-.2-.3-.4l.02-1.12z"/></svg>), placeholder: 'Add a Pin description...', disabled: false },
};

const SocialNav = ({ activeTab, setActiveTab }) => {
    const tabs = [{ name: 'Composer', icon: PencilSquareIcon }, { name: 'Analytics', icon: ChartBarIcon }, { name: 'Schedule', icon: CalendarIcon }, { name: 'Demographics', icon: InformationCircleIcon }];
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
    const [isGenerating] = useState(false);
    const [, setError] = useState('');
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
                                    // eslint-disable-next-line @next/next/no-img-element
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
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                        {scheduledPosts && scheduledPosts.length > 0 ? scheduledPosts.slice(0, 5).map(post => {
                            const platform = PLATFORMS[post.resource.platform];
                            const Icon = platform?.icon;
                            return (
                                <div key={post.id} className={`p-3 bg-gray-50 rounded-lg border-l-4 ${platform?.color || 'border-gray-400'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {Icon && <Icon className="h-4 w-4 text-gray-600" />}
                                            <span className="font-semibold text-sm text-gray-800">{platform?.name}</span>
                                        </div>
                                        <span className="text-xs text-blue-600 font-medium">{moment(post.start).format('MMM D, h:mm a')}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 truncate mt-1">{post.title.split(': ')[1]}</p>
                                </div>
                            );
                        }) : (
                            <p className="text-sm text-center text-gray-500 py-4">No posts scheduled.</p>
                        )}
                    
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
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch('/api/social/analytics');
                if (!res.ok) throw new Error('Failed to load analytics data.');
                setData(await res.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (isLoading) return <p className="text-center p-8">Loading analytics...</p>;
    if (error) return <p className="text-center p-8 text-red-600">{error}</p>;
    if (!data) return <p className="text-center p-8">No analytics data available.</p>;

    const { stats, dailyReach, platformStats } = data;

    const reachChartData = dailyReach.map(item => ({
        date: item.date,
        pageviews: item.reach,
        conversions: 0 // Not used for this chart
    }));

    const postsByPlatformData = platformStats.map(item => ({
        date: PLATFORMS[item.platform]?.name || item.platform,
        total_sales: item.postCount,
    }));
    
    const engagementByPlatformData = {
        labels: platformStats.map(item => PLATFORMS[item.platform]?.name || item.platform),
        datasets: [{
            label: 'Engagement Rate (%)',
            data: platformStats.map(item => parseFloat(item.engagementRate).toFixed(2)),
            backgroundColor: platformStats.map(item => PLATFORMS[item.platform]?.color || '#6B7280'),
        }]
    };

    return ( 
        <div className="bg-white p-6 rounded-lg shadow-md border space-y-8">
            <h3 className="text-2xl font-bold text-gray-800">Social Media Analytics Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-5 rounded-lg">
                    <p className="text-sm font-medium text-blue-600">Total Posts</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalPosts || 0}</p>
                </div>
                <div className="bg-green-50 p-5 rounded-lg">
                    <p className="text-sm font-medium text-green-600">Total Reach</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{(stats.totalReach || 0).toLocaleString()}</p>
                </div>
                <div className="bg-purple-50 p-5 rounded-lg">
                    <p className="text-sm font-medium text-purple-600">Engagement Rate</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{parseFloat(stats.engagementRate || 0).toFixed(2)}%</p>
                </div>
            </div>

            <div>
                <h4 className="text-xl font-semibold text-gray-800 mb-4">Daily Reach (Last 30 Days)</h4>
                <div className="h-80"><Ga4LineChart data={reachChartData} /></div>
            </div>

            <div>
                <h4 className="text-xl font-semibold text-gray-800 mb-4">Posts by Platform</h4>
                <div className="h-80"><SalesBarChart apiData={postsByPlatformData} currencySymbol="" /></div>
            </div>

            <div>
                <h4 className="text-xl font-semibold text-gray-800 mb-4">Engagement Rate by Platform</h4>
                <div className="h-80 flex justify-center"><AnalyticsChart data={engagementByPlatformData} /></div>
            </div>
        </div>
    );
};
const CustomEvent = ({ event }) => (
    <div className="flex flex-col text-xs">
        <strong className="font-semibold">{moment(event.start).format('h:mm a')}</strong>
        <span className="truncate">{event.title}</span>
    </div>
);

const ScheduleTabContent = ({ scheduledPosts, setScheduledPosts, fetchScheduledPosts, calendarDate, setCalendarDate, view, setView }) => {
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

    const eventPropGetter = useCallback((event) => ({
        style: { 
            backgroundColor: PLATFORMS[event.resource?.platform]?.name === 'X (Twitter)' ? '#1DA1F2' : '#E60023', 
            borderRadius: '5px', 
            border: 'none', 
            color: 'white' 
        }
    }), []);

    const dayPropGetter = useCallback((date) => {
        if (moment(date).isBefore(moment(), 'day')) {
            return {
                className: 'rbc-off-range-bg-disabled',
                style: {
                    backgroundColor: '#f3f4f6', 
                    cursor: 'not-allowed',
                },
            };
        }
        return {};
    }, []);

    const handleNavigate = (newDate) => setCalendarDate(newDate);
    
    const handleView = (newView) => setView(newView);

    return (
         <>
        <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-700 p-4 mb-6" role="alert">
            <div className="flex">
                <InformationCircleIcon className="h-5 w-5 text-blue-400 mr-3" />
                <p className="text-sm">You can drag and drop your scheduled posts to a new time or date. For more information, see our FAQ's.</p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border" style={{ height: '80vh' }}>
            <DragAndDropCalendar
                localizer={localizer}
                events={scheduledPosts}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                eventPropGetter={eventPropGetter}
                dayPropGetter={dayPropGetter}
                onEventDrop={onEventDrop} // Add this for drag and drop functionality
                views={['month', 'week', 'day', 'agenda']}
                date={calendarDate}
                view={view}
                onNavigate={handleNavigate}
                onView={handleView}
                resizable
                components={{ event: CustomEvent }}

            />
        </div>
        </>
    );
};

const DemographicsTabContent = () => {
    const [ageRange, setAgeRange] = useState('');
    const [sex, setSex] = useState('');
    const [country, setCountry] = useState('');
    const [currentDemographics, setCurrentDemographics] = useState(null);

    useEffect(() => {
        const fetchDemographics = async () => {
            try {
                const res = await fetch('/api/social/demographics');
                if (!res.ok) throw new Error('Failed to fetch demographics.');
                const data = await res.json();
                setCurrentDemographics(data);
                setAgeRange(data.age_range || '');
                setSex(data.sex || '');
                setCountry(data.country || '');
            } catch (error) { console.error('Error fetching demographics:', error); }
        };
        fetchDemographics();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        fetch('/api/social/demographics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ageRange, sex, country }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            alert('Demographic preferences saved successfully!');
            setCurrentDemographics({ age_range: ageRange, sex, country }); // Update current demographics after successful save
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Failed to save demographic preferences.');
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Demographics Insights</h3>
            <p className="text-gray-600 mb-6">
                Select demographic filters to gain insights into your audience. This feature allows you to tailor your content and campaigns more effectively.
            </p>

            {currentDemographics && (
                <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-700 p-4 mb-6" role="alert">
                    <p className="font-bold mb-2">Current Demographic Settings:</p>
                    <div className="flex items-center text-sm mb-1">
                        <CakeIcon className="h-5 w-5 mr-2" />
                        <span>Age Range: {currentDemographics.age_range || 'Not set'}</span>
                    </div>
                    <div className="flex items-center text-sm mb-1">
                        <UserIcon className="h-5 w-5 mr-2" />
                        <span>Sex: {currentDemographics.sex || 'Not set'}</span>
                    </div>
                    <div className="flex items-center text-sm">
                        <GlobeAltIcon className="h-5 w-5 mr-2" />
                        <span>Country: {currentDemographics.country || 'Not set'}</span>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="ageRange" className="block text-sm font-medium text-gray-700">Age Range</label>
                    <select
                        id="ageRange"
                        name="ageRange"
                        value={ageRange}
                        onChange={(e) => setAgeRange(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        <option value="">Select an age range</option>
                        <option value="13-17">13-17</option>
                        <option value="18-24">18-24</option>
                        <option value="25-34">25-34</option>
                        <option value="35-44">35-44</option>
                        <option value="45-54">45-54</option>
                        <option value="55-64">55-64</option>
                        <option value="65+">65+</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="sex" className="block text-sm font-medium text-gray-700">Sex</label>
                    <select
                        id="sex"
                        name="sex"
                        value={sex}
                        onChange={(e) => setSex(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        <option value="">Select sex</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                    <input
                        type="text"
                        id="country"
                        name="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="e.g., United States"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
                <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Apply Filters
                </button>
            </form>
        </div>
    );
};

export default function SocialMediaManagerPage() {
     const { status } = useSession();
    const [activeTab, setActiveTab] = useState('Composer');
    const [scheduledPosts, setScheduledPosts] = useState([]);
    
    // --- LIFTED STATE ---
    const [postContent, setPostContent] = useState('');
    const [postImages, setPostImages] = useState([]);
    const [selectedPlatform, setSelectedPlatform] = useState('x');
    const [userImages, setUserImages] = useState([]);
    const [isLoadingImages, setIsLoadingImages] = useState(true);
    const [activeDragId, setActiveDragId] = useState(null);

    // --- Calendar State ---
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [view, setView] = useState(Views.MONTH);

    const fetchScheduledPosts = useCallback(async () => {
        try {
            const res = await fetch('/api/social/schedule');
            const data = await res.json();
            const formattedEvents = data.map(post => ({
                id: post.id,
                title: `${PLATFORMS[post.platform]?.name || 'Post'}: ${post.content.substring(0, 30)}...`,
                start: new Date(post.scheduled_at),
                end: moment(post.scheduled_at).add(30, 'minutes').toDate(),
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
                    postImages={postImages}
                    setPostImages={setPostImages}
                    userImages={userImages}
                    isLoadingImages={isLoadingImages}
                    setIsLoadingImages={setIsLoadingImages}
                    activeDragId={activeDragId}
                    setActiveDragId={setActiveDragId}
                    fetchScheduledPosts={fetchScheduledPosts} // Pass fetchScheduledPosts
                    />
            )}
            {activeTab === 'Analytics' && <AnalyticsTabContent />}
            {activeTab === 'Schedule' && (
                <ScheduleTabContent 
                    scheduledPosts={scheduledPosts} 
                    setScheduledPosts={setScheduledPosts} 
                    fetchScheduledPosts={fetchScheduledPosts} // Pass fetchScheduledPosts
                    calendarDate={calendarDate}
                    setCalendarDate={setCalendarDate}
                    view={view}
                    setView={setView}
                />
            )
            }{activeTab === 'Demographics' && <DemographicsTabContent />}
        </Layout>
    );
}