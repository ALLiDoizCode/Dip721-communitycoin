import * as React from "react";
import Countdown from "react-countdown";

const LaunchTimer = (param: {distribuptionTime: Date}) => {
    const Completionist = () => <h3 className={"font-body"} >Coin has released</h3>;

    const renderer = ({ days, hours, minutes, seconds, completed }) => {
        if (completed) {
            // Render a completed state
            return <Completionist />;
        } else {
            // Render a countdown
            return <>
            <h1>Launch Countdown</h1>
            <div className="counter">
                <div className="time">
                    <div className="time-value">{days.toString().padStart(2, '0')}</div>
                    <div className="time-label">Days</div>
                </div>
                <div className="time">
                    <div className="time-value">{hours.toString().padStart(2, '0')}</div>
                    <div className="time-label">Hours</div>
                </div>
                <div className="time">
                    <div className="time-value">{minutes.toString().padStart(2, '0')}</div>
                    <div className="time-label">Minutes</div>
                </div>
                <div className="time">
                    <div className="time-value">{seconds.toString().padStart(2, '0')}</div>
                    <div className="time-label">Seconds</div>
                </div>
            </div>
            </>

        }
    };
    
    return <>
     <Countdown className={"timer"} renderer={renderer} date={param.distribuptionTime}/>
    </>
    
}

export default LaunchTimer