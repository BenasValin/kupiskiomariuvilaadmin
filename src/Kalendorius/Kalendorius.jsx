import './Kalendorius.css';
import NavBar from '../NavBar/NavBar';
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Navigate } from 'react-router-dom';
import 'moment/locale/lt';
import 'react-dates/initialize';
import { DayPickerRangeController, SingleDatePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import useWindowWidth from './useWindowWidth'; // Import custom hook

moment.locale('lt');

const houses = ['zvejunamelis', 'pagrindisPastatasPirmas', 'pagrindisPastatasAntras', 'pirtiesPastatasPirmas', 'pirtiesPastatasAntras'];

const getRandomColor = () => {
    const letters = '6789ABCD';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * letters.length)];
    }
    return color;
};

function Kalendorius() {
    const windowWidth = useWindowWidth(); // Get window width
    const numberOfMonths = windowWidth < 1230 ? 1 : 2;

    const [isAuthenticated, setIsAuthenticated] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsAuthenticated(false);
        }
    }, []);

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }
    return (
        <div>
            <NavBar />
            <div className="mainContainer">
                {houses.map(house => (
                    <HouseCalendar key={house} house={house} numberOfMonths={numberOfMonths} />
                ))}
            </div>
        </div>
    );
}

const HouseCalendar = ({ house, numberOfMonths }) => {
    const [notificationText, setNotificationText] = useState('');
    const [notificationKey, setNotificationKey] = useState(0);
    const [blockedDates, setBlockedDates] = useState([]);
    const [bookedRanges, setBookedRanges] = useState([]);
    const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
    const [focusedInput, setFocusedInput] = useState('startDate');
    const [focusedStartDate, setFocusedStartDate] = useState(false);
    const [focusedEndDate, setFocusedEndDate] = useState(false);
    const [bookingInfo, setBookingInfo] = useState({
        name: '',
        surname: '',
        phone: '',
        email: '',
        message: ''
    });
    const [selectedDays, setSelectedDays] = useState(0);
    const [selectedRange, setSelectedRange] = useState(null);

    useEffect(() => {
        const fetchBlockedDates = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/blocked-dates?house=${house}`);
                const data = await response.json();
                setBlockedDates(data.map(date => moment(date.date)));
            } catch (error) {
                console.error('Error fetching blocked dates:', error);
            }
        };

        const fetchBookedRanges = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/booked-ranges?house=${house}`);
                const data = await response.json();
                setBookedRanges(data.map(range => ({
                    house: range.house,
                    startDate: moment(range.start_date),
                    endDate: moment(range.end_date),
                    color: getRandomColor()
                })));
            } catch (error) {
                console.error('Error fetching booked ranges:', error);
            }
        };

        fetchBlockedDates();
        fetchBookedRanges();
    }, [house]);

    const isOutsideRange = (day) => {
        return moment().diff(day, 'days') > 0 || blockedDates.some(d => d.isSame(day, 'day'));
    };

    const isRangeValid = (start, end, excludeRange = null) => {
        if (!start || !end) return false;
        let day = moment(start);
        while (day <= end) {
            if (blockedDates.some(d => d.isSame(day, 'day')) ||
                bookedRanges.some(range => {
                    if (excludeRange && range.startDate.isSame(excludeRange.startDate) && range.endDate.isSame(excludeRange.endDate)) {
                        return false;
                    }
                    return day.isBetween(range.startDate, range.endDate, 'day', '[]');
                })) {
                return false;
            }
            day.add(1, 'days');
        }
        return true;
    };

    const handleDatesChange = ({ startDate, endDate }) => {
        const selectedRange = bookedRanges.find(range => startDate && startDate.isBetween(range.startDate, range.endDate, 'day', '[]'));

        if (selectedRange) {
            setNotificationText(`Selected date is within a booked range from ${selectedRange.startDate.format('YYYY-MM-DD')} to ${selectedRange.endDate.format('YYYY-MM-DD')}`);
            setNotificationKey(prevKey => prevKey + 1); // Force re-render

            setDateRange({ startDate: selectedRange.startDate, endDate: selectedRange.endDate }); // Set date range to selected range

            setFocusedInput('startDate'); // Reset focus to start date

            setSelectedDays(selectedRange.endDate.diff(selectedRange.startDate, 'days') + 1); // Set selected days

            setSelectedRange(selectedRange); // Set selected range

            // Fetch existing booking information
            fetchBookingInfo(selectedRange.startDate);
        } else if (startDate && endDate) {
            if (!isRangeValid(startDate, endDate)) {
                setNotificationText("Deja, jūsų pasirinktas laikotarpis jau užimtas. Pasirinkite laikotarpį, kuriame nėra užspalvintų langelių");
                setNotificationKey(prevKey => prevKey + 1); // Force re-render

                setDateRange({ startDate, endDate: null }); // Reset endDate to null

                setFocusedInput('startDate'); // Reset focus to start date

                setSelectedDays(0);

                setSelectedRange(null); // Clear selected range
            } else {
                setDateRange({ startDate, endDate });

                const start = moment(startDate).startOf('day');
                const end = moment(endDate).startOf('day');
                const days = end.diff(start, 'days') + 1; // Include the start date

                setSelectedDays(days);

                setFocusedInput(null); // Reset focus to prevent getting stuck

                fetchBookingInfo(startDate);

                setSelectedRange(null); // Clear selected range
            }
        } else if (startDate && !endDate) {
            setDateRange({ startDate, endDate });

            setFocusedInput('endDate');

            setSelectedRange(null); // Clear selected range if not fully selected
        } else {
            setDateRange({ startDate, endDate });

            setFocusedInput('startDate');

            if (!startDate || !endDate) {
                setSelectedDays(0);
            }

            setSelectedRange(null); // Clear selected range if not fully selected
        }
    };

    const handleFocusChange = (focusedInput) => {
        setFocusedInput(focusedInput || 'startDate');
    };

    const fetchBookingInfo = (date) => {
        fetch(`http://localhost:5000/api/booking-info?date=${moment(date).format('YYYY-MM-DD')}`)
            .then(response => response.json())
            .then(data => {
                const booking = data[0];
                if (booking) {
                    setBookingInfo({
                        name: booking.name,
                        surname: booking.surname,
                        phone: booking.phone,
                        email: booking.email,
                        message: booking.message
                    });
                } else {
                    setBookingInfo({
                        name: '',
                        surname: '',
                        phone: '',
                        email: '',
                        message: ''
                    });
                }
            })
            .catch(error => console.error('Error fetching booking info:', error));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBookingInfo(prevBookingInfo => ({
            ...prevBookingInfo,
            [name]: value
        }));
    };

    const handleBookingConfirmation = () => {
        const { startDate, endDate } = dateRange;
        const { name, surname, phone, email, message } = bookingInfo;
        if (!endDate || !startDate) {
            window.alert("Prašome pasirinkti atvykimo ir išvykimo datas");
            return;
        }
        fetch('http://localhost:5000/api/book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                house,
                startDate: startDate.format('YYYY-MM-DD'),
                endDate: endDate.format('YYYY-MM-DD'),
                name,
                surname,
                phone,
                email,
                message
            })
        })
            .then(response => response.json())
            .then(data => {
                alert('Booking confirmed!');
                setDateRange({ startDate: null, endDate: null });
                setBookingInfo({
                    name: '',
                    surname: '',
                    phone: '',
                    email: '',
                    message: ''
                });

                // Refetch booked ranges to update the calendar
                return fetch(`http://localhost:5000/api/booked-ranges?house=${house}`);
            })
            .then(response => response.json())
            .then(data => {
                setBookedRanges(data.map(range => ({
                    house: range.house,
                    startDate: moment(range.start_date),
                    endDate: moment(range.end_date),
                    color: getRandomColor()
                })));
            })
            .catch(error => console.error('Error confirming booking:', error));
    };

    const handleSaveInputBoxInformation = () => {
        if (selectedRange) {
            const { startDate, endDate } = dateRange;
            const { name, surname, phone, email, message } = bookingInfo;

            if (!isRangeValid(startDate, endDate, selectedRange)) {
                setNotificationText("Selected range conflicts with existing bookings or blocked dates. Please select a valid range.");
                setNotificationKey(prevKey => prevKey + 1); // Force re-render
                return;
            }

            fetch('http://localhost:5000/api/update-booking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    house,
                    originalStartDate: selectedRange.startDate.format('YYYY-MM-DD'),
                    originalEndDate: selectedRange.endDate.format('YYYY-MM-DD'),
                    newStartDate: startDate.format('YYYY-MM-DD'),
                    newEndDate: endDate.format('YYYY-MM-DD'),
                    name,
                    surname,
                    phone,
                    email,
                    message
                })
            })
                .then(response => response.json())
                .then(data => {
                    alert('Booking information updated!');
                    setSelectedRange(null); // Clear selected range

                    // Refetch booked ranges to update the calendar
                    return fetch(`http://localhost:5000/api/booked-ranges?house=${house}`);
                })
                .then(response => response.json())
                .then(data => {
                    setBookedRanges(data.map(range => ({
                        house: range.house,
                        startDate: moment(range.start_date),
                        endDate: moment(range.end_date),
                        color: getRandomColor()
                    })));
                })
                .catch(error => console.error('Error updating booking information:', error));
        } else {
            handleBookingConfirmation();
        }
    };

    const handleDeleteRange = () => {
        if (selectedRange) {
            const { startDate, endDate } = selectedRange;

            fetch('http://localhost:5000/api/delete-range', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    house,
                    startDate: startDate.format('YYYY-MM-DD'),
                    endDate: endDate.format('YYYY-MM-DD')
                })
            })
                .then(response => response.json())
                .then(data => {
                    alert('Range deleted!');
                    setSelectedRange(null); // Clear selected range

                    // Refetch booked ranges to update the calendar
                    return fetch(`http://localhost:5000/api/booked-ranges?house=${house}`);
                })
                .then(response => response.json())
                .then(data => {
                    setBookedRanges(data.map(range => ({
                        house: range.house,
                        startDate: moment(range.start_date),
                        endDate: moment(range.end_date),
                        color: getRandomColor()
                    })));
                })
                .catch(error => console.error('Error deleting range:', error));
        }
    };

    const renderDayContents = (day) => {
        let bgColor = '';
        let isInBookedRange = false;
        bookedRanges.forEach(range => {
            if (day.isBetween(range.startDate, range.endDate, 'day', '[]')) {
                bgColor = range.color;
                isInBookedRange = true;
            }
        });
        const { startDate, endDate } = dateRange;
        if (startDate && endDate && day.isBetween(startDate, endDate, 'day', '[]') && !isInBookedRange) {
            bgColor = '#00BFFF'; // Default neon blue color
        }
        return (
            <div style={{ backgroundColor: bgColor, width: '100%', height: '100%', cursor: isInBookedRange ? 'default' : 'pointer' }}>
                {day.date()}
            </div>
        );
    };

    return (
        <div className='houseContainer'>
            <h1 style={{margin: "auto auto"}}>{house.replace(/([A-Z])/g, ' $1')}</h1>
            <div className="kalendoriusContainer">
                <div>
                    <DayPickerRangeController
                        startDate={dateRange.startDate}
                        endDate={dateRange.endDate}
                        onDatesChange={handleDatesChange}
                        focusedInput={focusedInput}
                        onFocusChange={handleFocusChange}
                        numberOfMonths={numberOfMonths}
                        isOutsideRange={isOutsideRange}
                        hideKeyboardShortcutsPanel={true}
                        noBorder={true}
                        readOnly={true}
                        key={notificationKey} // Use notificationKey as a key to force re-render
                        renderDayContents={renderDayContents}
                    />
                </div>
                <div className='kalendoriusInfoContainer'>
                    <input
                        type="text"
                        name="name"
                        value={bookingInfo.name}
                        onChange={handleInputChange}
                        placeholder="Vardas"
                    />
                    <input
                        type="text"
                        name="surname"
                        value={bookingInfo.surname}
                        onChange={handleInputChange}
                        placeholder="Pavardė"
                    />
                    <input
                        type="text"
                        name="phone"
                        value={bookingInfo.phone}
                        onChange={handleInputChange}
                        placeholder="Tel. Nr."
                    />
                    <input
                        type="email"
                        name="email"
                        value={bookingInfo.email}
                        onChange={handleInputChange}
                        placeholder="El. Paštas"
                    />
                    <textarea
                        name="message"
                        value={bookingInfo.message}
                        onChange={handleInputChange}
                        placeholder="Užsakymo informacija"
                    />
                    <div className="datePickersContainer">
                        <a>Atvykimas</a>
                        <a>išvykimas</a>
                        <SingleDatePicker
                            date={dateRange.startDate}
                            onDateChange={date => setDateRange(prev => ({ ...prev, startDate: date }))}
                            focused={focusedStartDate}
                            onFocusChange={({ focused }) => setFocusedStartDate(focused)}
                            id="start_date_picker"
                            isOutsideRange={isOutsideRange}
                            displayFormat="YYYY-MM-DD"
                            numberOfMonths={1}
                            noBorder={true}
                        />
                       
                        <SingleDatePicker
                            date={dateRange.endDate}
                            onDateChange={date => setDateRange(prev => ({ ...prev, endDate: date }))}
                            focused={focusedEndDate}
                            onFocusChange={({ focused }) => setFocusedEndDate(focused)}
                            id="end_date_picker"
                            isOutsideRange={isOutsideRange}
                            displayFormat="YYYY-MM-DD"
                            numberOfMonths={1}
                            noBorder={true}
                        />
                    </div>
                    <button onClick={handleSaveInputBoxInformation}>
                        {selectedRange ? 'Išsaugoti informaciją' : 'Patvirtinti užsakymą'}
                    </button>
                    {selectedRange && <button onClick={handleDeleteRange}>Atšaukti užsakymą</button>}
                </div>
            </div>
            {notificationText && <div className="notification">{notificationText}</div>}
        </div>
    );
};

export default Kalendorius;
                                    