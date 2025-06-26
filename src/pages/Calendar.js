import React, { useState, useEffect } from 'react';
import axios from 'axios';
import style from '../component/css/Calendar.module.css';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const Calendar = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();

  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [viewMode, setViewMode] = useState('month');
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearPopup, setShowYearPopup] = useState(false);
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [todayEvents, setTodayEvents] = useState([]);
  const [showTodayPopup, setShowTodayPopup] = useState(false);

  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();

  const currentDate = today.getDate();
  const isCurrentMonth = month === today.getMonth() && year === today.getFullYear();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getStartDay = (month, year) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(month, year);
  const startDay = getStartDay(month, year);

  useEffect(() => {
    if (!user || !token) {
      navigate('/login');
    } else {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [user, token, navigate]);

  useEffect(() => {
    if (user?.id && token) {
      axios
        .get(`http://127.0.0.1:8000/calendar-events/user/${user.id}/`)
        .then((res) => {
          setEvents(res.data);

          const todayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(currentDate).padStart(2, '0')}`;
          const todays = res.data.filter(ev => ev.date === todayStr);

          if (todays.length > 0) {
            setTodayEvents(todays);
            setShowTodayPopup(true);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [month, year, user, token]);

  const handleAddEvent = () => {
    if (!user?.id || !eventTitle || !selectedDate) return;

    const payload = {
      user: user.id,
      title: eventTitle,
      date: selectedDate,
    };

    axios
      .post('http://127.0.0.1:8000/calendar-events/', payload)
      .then((res) => {
        setEvents((prev) => [...prev, res.data]);
        setEventTitle('');
        setShowModal(false);
      })
      .catch((err) => console.error(err));
  };

  const handleDeleteEvent = (eventId) => {
    axios
      .delete(`http://127.0.0.1:8000/calendar-events/${eventId}/`)
      .then(() => {
        setEvents((prev) => prev.filter(ev => ev.id !== eventId));
      })
      .catch((err) => console.error('Delete failed:', err));
  };

  const handleMonthChange = (m) => {
    setMonth(m);
    setShowMonthDropdown(false);
  };

  const handleYearChange = (y) => {
    setYear(y);
    setShowYearPopup(false);
  };

  const handleToday = () => {
    setMonth(today.getMonth());
    setYear(today.getFullYear());
  };

  const handlePrev = () => {
    if (month === 0) {
      setMonth(11);
      setYear((prev) => prev - 1);
    } else {
      setMonth((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (month === 11) {
      setMonth(0);
      setYear((prev) => prev + 1);
    } else {
      setMonth((prev) => prev + 1);
    }
  };

  if (!user || !token) {
    return <p className={style.protectedMessage}>🔐 Please login to access the calendar.</p>;
  }

  return (
    <div className={style.calendarContainer}>
      <aside className={style.calendarSidebar}>
        <h2>Calendar</h2>
        <ul>
          <li className={viewMode === 'month' ? style.active : ''} onClick={() => setViewMode('month')}>Month</li>
          <li className={viewMode === 'week' ? style.active : ''} onClick={() => setViewMode('week')}>Week</li>
          <li className={viewMode === 'day' ? style.active : ''} onClick={() => setViewMode('day')}>Day</li>
        </ul>
      </aside>

      <main className={style.calendarMain}>
        <div className={style.calendarHeader}>
          <div className={style.calendarHeaderTitle}>
            <h1 onClick={() => setShowMonthDropdown(!showMonthDropdown)}>{monthNames[month]}</h1>
            <h1 onClick={() => setShowYearPopup(true)}>{year}</h1>
          </div>
          <div className={style.calendarControls}>
            <button onClick={handleToday}>Today</button>
            <button onClick={handlePrev}>&lt;</button>
            <button onClick={handleNext}>&gt;</button>
          </div>
        </div>

        {showMonthDropdown && (
          <div className={style.dropdown}>
            {monthNames.map((m, idx) => (
              <div key={idx} onClick={() => handleMonthChange(idx)}>{m}</div>
            ))}
          </div>
        )}

        {showYearPopup && (
          <div className={style.yearPopup}>
            <div className={style.yearPopupContent}>
              <h2>Select a Year</h2>
              <div className={style.yearGrid}>
                {[...Array(100)].map((_, i) => {
                  const y = 1970 + i;
                  return (
                    <div key={y} onClick={() => handleYearChange(y)}>{y}</div>
                  );
                })}
              </div>
              <button onClick={() => setShowYearPopup(false)}>Close</button>
            </div>
          </div>
        )}

        {viewMode === 'month' && (
          <div className={style.calendarGrid}>
            {days.map((day) => (
              <div key={day} className={style.calendarDayName}>{day}</div>
            ))}
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} className={style.calendarCell}></div>
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const date = i + 1;
              const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
              const isToday = isCurrentMonth && date === currentDate;
              const dayEvents = events.filter(ev => ev.date === fullDate);

              return (
                <div
                  key={date}
                  className={`${style.calendarCell} ${isToday ? style.today : ''}`}
                  onClick={() => {
                    setSelectedDate(fullDate);
                    setShowModal(true);
                  }}
                >
                  <span>{date}</span>
                  {dayEvents.map((ev, idx) => (
                    <div key={idx} className={style.eventItem}>
                      {ev.title}
                      <button
                        className={style.deleteButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEvent(ev.id);
                        }}
                      >
                        ❌
                      </button>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {viewMode === 'week' && <div className={style.weekView}>[Week View Placeholder]</div>}
        {viewMode === 'day' && <div className={style.dayView}>[Day View Placeholder]</div>}
      </main>

      {showModal && (
        <div className={style.modal}>
          <div className={style.modalContent}>
            <h3>Add Event for {selectedDate}</h3>
            <input
              type="text"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="Event title"
            />
            <button onClick={handleAddEvent}>Add</button>
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {showTodayPopup && (
        <div className={style.modal}>
          <div className={style.modalContent}>
            <h3>📅 You have event(s) today ({today.toISOString().split('T')[0]}):</h3>
            <ul>
              {todayEvents.map((ev, i) => (
                <li key={i}>🔹 {ev.title}</li>
              ))}
            </ul>
            <button onClick={() => setShowTodayPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
