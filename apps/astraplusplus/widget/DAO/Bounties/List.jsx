const bounties = props.bounties;
const currentPage = props.page ?? 1;
const resPerPage = props.resPerPage ?? 6;

console.log(bounties);

const bountieslink = "#//*__@appAccount__*//widget/home?tab=bounties";

State.init({
    currentPage: currentPage,
    search: null,
    isTyping: false
});

const renderSubheader = () => (
    <div className="d-flex align-items-center gap-2 mt-4">
        <Widget
            key="search"
            src="nearui.near/widget/Input.ExperimentalText"
            props={{
                placeholder: "Search by name",
                type: "search",
                size: "md",
                icon: (
                    <i
                        className="bi bi-search"
                        style={{
                            color: "#4498E0"
                        }}
                    />
                ),
                onChange: (v) => {
                    State.update({
                        search: v,
                        isTyping: true
                    });
                    setTimeout(() => {
                        State.update({
                            isTyping: false
                        });
                    }, 1500);
                },
                value: undefined,
                inputProps: {
                    autoFocus: true
                },
                useTimeout: 600
            }}
        />
        <Widget
            src="/*__@appAccount__*//widget/Layout.Modal"
            props={{
                open: state.filtersOpen,
                onOpenChange: (open) => {
                    State.update({
                        ...state,
                        filtersOpen: open
                    });
                },
                toggle: (
                    <Widget
                        src="nearui.near/widget/Input.Button"
                        props={{
                            children: (
                                <>
                                    Filter
                                    <i className="bi bi-funnel"></i>
                                </>
                            ),
                            variant: "outline disabled",
                            size: "md",
                            disabled: true
                        }}
                    />
                ),
                content: <div className="ndc-card p-2">WIP</div>
            }}
        />
    </div>
);

const renderEmpty = () => (
    <div
        className="d-flex flex-column justify-content-center align-content-center text-center gap-3 m-auto"
        style={{
            height: "max(50vh, 400px)",
            maxWidth: "460px"
        }}
    >
        <i
            className="bi bi-exclamation-circle"
            style={{ fontSize: "4rem", color: "#4498E0" }}
        />
        <p className="h6">No bounty is found.</p>
        <Widget
            src="nearui.near/widget/Input.Button"
            props={{
                children: "Go to home",
                variant: "info outline w-100",
                size: "lg",
                href: "#//*__@appAccount__*//widget/home"
            }}
        />
    </div>
);

const renderLoading = () => (
    <Widget
        src="nearui.near/widget/Feedback.Spinner"
        props={{
            color1: "#4498E0",
            color2: "#000000"
        }}
    />
);

let filteredBounties = [];
let paginatedBounties = [];
if (bounties && !state.isTyping) {
    filteredBounties = bounties.filter((d) => {
        if (!d.bounty) return false;
        if (state.search == null) return true;

        return d.daoId.toLowerCase().includes(state.search.toLowerCase());
    });
    paginatedBounties = filteredBounties.slice(
        (state.currentPage - 1) * resPerPage,
        state.currentPage * resPerPage
    );
}

const renderBountiesRows = () => {
    return (
        <div className="row g-3 flex-wrap">
            {paginatedBounties.map((bounty) => (
                <div
                    key={bounty.id}
                    className="flex-grow-1 col-12 col-md-6 col-lg-3"
                    style={{ minWidth: "360px" }}
                >
                    <Widget
                        src="/*__@appAccount__*//widget/DAO.Bounties.Card"
                        props={{ ...bounty }}
                    />
                </div>
            ))}
            {paginatedBounties.length < resPerPage &&
                [...Array(resPerPage - paginatedBounties.length)].map(
                    (_, i) => (
                        <div
                            key={`empty-${i}`}
                            className="flex-grow-1 col-12 col-md-6 col-lg-3"
                            style={{
                                minWidth: "360px"
                            }}
                        ></div>
                    )
                )}
        </div>
    );
};
const renderPagination = () => (
    <div className="d-flex justify-content-center align-items-center gap-2">
        <Widget
            src="nearui.near/widget/Navigation.Paginate"
            props={{
                pageSize: resPerPage,
                currentPage: state.currentPage,
                totalPageCount: Math.ceil(filteredBounties.length / resPerPage),
                onPageChange: (page) => {
                    State.update({
                        currentPage: page
                    });
                },
                revaluateOnRender: true
            }}
        />
    </div>
);

return (
    <>
        {renderSubheader()}
        {!state.isTyping &&
            bounties != null &&
            (!bounties || bounties.length < 1 || filteredBounties.length < 1) &&
            renderEmpty()}
        {(state.isTyping || bounties == null) && renderLoading()}
        {!state.isTyping &&
            ((bounties != null && bounties) || bounties.length > 0) && (
                <div className="my-4">{renderBountiesRows()}</div>
            )}
        {((bounties != null && bounties) ||
            bounties.length > resPerPage ||
            filteredBounties.length > resPerPage) &&
            renderPagination()}
    </>
);
