const applyFilters = props.applyFilters;
const cancel = props.cancel;
const selectedFilters = props.selectedFilters;
const filterlist = props.filterlist;
const groupTypes = props.groupTypes;

State.init({
    selectedFilters: selectedFilters
});

const setFilters = (f, close) => {
    State.update({
        selectedFilters: f
    });
    applyFilters(state.selectedFilters);
    if (close) {
        cancel();
    }
};

const Wrapper = styled.div`
    width: max-content;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;

    .m-2 {
        margin: 1rem !important;
    }

    .item {
        align-items: center;
        padding-right: 5rem;
        &:hover {
            background-color: rgba(0, 0, 0, 0.04);
        }
    }

    .outline-btn {
        color: gray;
        text-decoration: underline;
        background-color: transparent;
        border: none;

        &:hover {
            background-color: transparent !important;
            border: none !important;
            color: darkgray !important;
            text-decoration: underline !important;
        }

        &:active {
            background-color: transparent !important;
            border: none !important;
            color: darkgray !important;
            text-decoration: underline !important;
        }
        &:focus-visible {
            background-color: transparent !important;
            border: none !important;
            color: darkgray !important;
            text-decoration: underline !important;
        }
    }
`;

return (
    <Wrapper className="ndc-card">
        <div>
            {filterlist?.map((item) => (
                <div
                    className="d-flex gap-4 item"
                    onClick={(event) => {
                        const data = [...state.selectedFilters];
                        // treat descending and ascending as radio button
                        const isDescendingSelected =
                            event?.target?.id === groupTypes.DESCENDING;
                        const isAscendingSelected =
                            event?.target?.id === groupTypes.ASCENDING;
                        const isEarliest =
                            event?.target?.id === groupTypes.EARLIEST;
                        const isLatest =
                            event?.target?.id === groupTypes.LATEST;
                        if (
                            (isDescendingSelected &&
                                data?.includes(groupTypes.ASCENDING)) ||
                            (isAscendingSelected &&
                                data?.includes(groupTypes.DESCENDING))
                        ) {
                            data = data.filter((item) => {
                                return isDescendingSelected
                                    ? item !== groupTypes.ASCENDING
                                    : item !== groupTypes.DESCENDING;
                            });
                            data.push(event.target.id);
                            setFilters(data);
                        }
                        // treat latest and earliest as radio button
                        else if (
                            (isEarliest && data?.includes(groupTypes.LATEST)) ||
                            (isLatest && data?.includes(groupTypes.EARLIEST))
                        ) {
                            data = data.filter((item) => {
                                return isEarliest
                                    ? item !== groupTypes.LATEST
                                    : item !== groupTypes.EARLIEST;
                            });
                            data.push(event.target.id);
                            setFilters(data);
                        } else if (data?.includes(event?.target?.id)) {
                            setFilters(
                                data.filter((item) => item !== event.target.id)
                            );
                        } else {
                            data.push(event.target.id);
                            setFilters(data);
                        }
                    }}
                    id={item}
                >
                    <input
                        id={item}
                        className="m-2"
                        type="checkbox"
                        value={item}
                        checked={state.selectedFilters.includes(item) || false}
                    />
                    <label id={item} className="form-check-label">
                        {item}
                    </label>
                </div>
            ))}
        </div>
        <button className="outline-btn" onClick={() => setFilters([], true)}>
            Clear Filter
        </button>
    </Wrapper>
);
