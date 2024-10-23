const timeToCheck = props.timeToCheck;

const timer = setInterval(() => {
    const currentDate = new Date().getTime();
    const difference = timeToCheck - currentDate;

    if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
            (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
            (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        State.update({
            days: days,
            hours: hours,
            minutes: minutes,
            seconds: seconds
        });
    }
    clearInterval(timer);
}, 1000);

return (
    <div>
        {(state.days > 0 ||
            state.hours > 0 ||
            state.minutes > 0 ||
            state.seconds > 0) &&
            `${state.days}d ${state.hours}h ${state.minutes}m ${state.seconds}s left`}
    </div>
);
