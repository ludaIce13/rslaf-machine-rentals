import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaPlus, FaSearch, FaEdit, FaEye, FaPlusCircle, FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'day', 'week', 'month'
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    rentals: true,
    maintenance: false,
    allItems: true
  });

  // Sample events data
  useEffect(() => {
    const sampleEvents = [
      {
        id: 1,
        title: 'Olivia Rhye',
        item: 'Projector X100',
        startDate: '2023-10-25',
        endDate: '2023-10-28',
        status: 'Confirmed',
        type: 'rental',
        color: '#2ecc71'
      },
      {
        id: 2,
        title: 'Phoenix Baker',
        item: 'Sound System Pro',
        startDate: '2023-10-22',
        endDate: '2023-10-24',
        status: 'Picked up',
        type: 'rental',
        color: '#3498db'
      },
      {
        id: 3,
        title: 'Maintenance',
        item: 'Camera Equipment',
        startDate: '2023-10-20',
        endDate: '2023-10-21',
        status: 'Scheduled',
        type: 'maintenance',
        color: '#e67e22'
      },
      {
        id: 4,
        title: 'Lana Steiner',
        item: 'Lighting Kit',
        startDate: '2023-10-20',
        endDate: '2023-10-23',
        status: 'Returned',
        type: 'rental',
        color: '#9b59b6'
      }
    ];
    setEvents(sampleEvents);
  }, []);

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const generateMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = events.filter(event => 
        event.startDate <= dateStr && event.endDate >= dateStr
      );
      days.push({ day, date: dateStr, events: dayEvents });
    }
    
    return days;
  };

  const getEventsForDay = (date) => {
    return events.filter(event => 
      event.startDate <= date && event.endDate >= date
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-100 text-green-800 border border-green-200';
      case 'Picked up': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Returned': return 'bg-gray-100 text-gray-600 border border-gray-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border border-red-200';
      case 'Scheduled': return 'bg-orange-100 text-orange-800 border border-orange-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const openEventModal = (event = null) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const renderMonthView = () => {
    const days = generateMonthDays();
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div className="calendar-grid">
        <div className="week-headers">
          {weekDays.map(day => (
            <div key={day} className="week-header">
              {day}
            </div>
          ))}
        </div>
        
        <div className="days-grid">
          {days.map((day, index) => (
            <div key={index} className={`day-cell ${day ? 'current-month' : 'other-month'}`}>
              {day && (
                <>
                  <div className="day-number">{day.day}</div>
                  <div className="day-events">
                    {day.events.map(event => (
                      <div 
                        key={event.id} 
                        className="event-item"
                        style={{ borderLeftColor: event.color }}
                        onClick={() => openEventModal(event)}
                      >
                        <div className="event-dot" style={{ backgroundColor: event.color }}></div>
                        <div className="event-content">
                          <div className="event-title">{event.title}</div>
                          <div className="event-item">{event.item}</div>
                          <div className="event-date">
                            {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                          </div>
                          <span className={`event-status ${getStatusColor(event.status)}`}>
                            {event.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = [];
    const today = new Date();
    const currentDay = currentDate.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push({
        date: date.toISOString().split('T')[0],
        day: date.getDate(),
        name: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]
      });
    }

    return (
      <div className="week-view">
        <div className="week-grid">
          {weekDays.map(day => (
            <div key={day.date} className="week-day">
              <div className="week-day-header">
                <div className="week-day-name">{day.name}</div>
                <div className="week-day-number">{day.day}</div>
              </div>
              <div className="week-day-events">
                {getEventsForDay(day.date).map(event => (
                  <div 
                    key={event.id} 
                    className="week-event"
                    style={{ backgroundColor: event.color }}
                    onClick={() => openEventModal(event)}
                  >
                    <div className="week-event-title">{event.title}</div>
                    <div className="week-event-item">{event.item}</div>
                    <span className="week-event-status">{event.status}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const today = new Date();
    const currentDay = currentDate.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay);
    
    const dayEvents = getEventsForDay(currentDate.toISOString().split('T')[0]);

    return (
      <div className="day-view">
        <div className="day-header">
          <div className="day-title">
            {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
        <div className="day-events-list">
          {dayEvents.map(event => (
            <div 
              key={event.id} 
              className="day-event"
              style={{ borderLeftColor: event.color }}
              onClick={() => openEventModal(event)}
            >
              <div className="day-event-time">
                {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                {new Date(event.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="day-event-content">
                <div className="day-event-title">{event.title}</div>
                <div className="day-event-item">{event.item}</div>
                <span className={`day-event-status ${getStatusColor(event.status)}`}>
                  {event.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Calendar</h1>
          <p className="text-gray-600 text-lg">Manage your rental schedule and bookings</p>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleToday}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Today
                </button>
                <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <FaChevronLeft />
                </button>
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <FaChevronRight />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setViewMode('day')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      viewMode === 'day' 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Day
                  </button>
                  <button 
                    onClick={() => setViewMode('week')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      viewMode === 'week' 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Week
                  </button>
                  <button 
                    onClick={() => setViewMode('month')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      viewMode === 'month' 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Month
                  </button>
                </div>

                <div className="relative">
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search items or customers..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <button 
                  onClick={() => openEventModal()}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <FaPlus /> New Booking
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-xl p-4 mb-6 border border-gray-100">
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={filters.rentals}
                  onChange={(e) => setFilters({...filters, rentals: e.target.checked})}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="text-gray-700">Rentals</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={filters.maintenance}
                  onChange={(e) => setFilters({...filters, maintenance: e.target.checked})}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="text-gray-700">Maintenance</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={filters.allItems}
                  onChange={(e) => setFilters({...filters, allItems: e.target.checked})}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="text-gray-700">All Items</span>
              </label>
            </div>
          </div>

          {/* Calendar View */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="p-6">
              {viewMode === 'month' && renderMonthView()}
              {viewMode === 'week' && renderWeekView()}
              {viewMode === 'day' && renderDayView()}
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedEvent ? 'Edit Booking' : 'New Rental'}
                </h3>
                <button 
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option>Select customer...</option>
                    <option>Olivia Rhye</option>
                    <option>Phoenix Baker</option>
                    <option>Lana Steiner</option>
                    <option>Demi Wilkinson</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Item(s) Rented</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option>Select item...</option>
                    <option>Projector X100</option>
                    <option>Sound System Pro</option>
                    <option>Lighting Kit</option>
                    <option>Camera Equipment</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rental Status</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option>Confirmed</option>
                    <option>Pending</option>
                    <option>Picked up</option>
                    <option>Returned</option>
                    <option>Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea 
                    rows={3}
                    placeholder="Any special instructions..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;