const applyView = props.applyView;
const cancel = props.cancel;
const selectedView = props.selectedView;
const viewList = props.viewList;

const Wrapper = styled.div`
    width: max-content;
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
    <Wrapper>
        <div>
            {viewList?.map((item) => (
                <div
                    className="d-flex gap-4 item"
                    onClick={() => applyView(item.value)}
                >
                    <input
                        className="m-2"
                        type="radio"
                        value={item.value}
                        checked={selectedView === item.value}
                    />
                    <label className="form-check-label">{item.label}</label>
                </div>
            ))}
        </div>
    </Wrapper>
);
