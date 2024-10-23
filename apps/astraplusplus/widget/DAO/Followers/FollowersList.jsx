const data = props.data;
const currentPage = props.page ?? 1;
const resPerPage = props.resPerPage ?? 20;
const accountId = props.accountId ?? context.accountId;

const viewTypes = {
    CARD: "Card",
    LIST: "List"
};

const viewList = [
    {
        label: "List View",
        value: viewTypes.LIST
    },
    {
        label: "Card View",
        value: viewTypes.CARD
    }
];

const filterItems = {
    EARLIEST: "Earliest",
    LATEST: "Latest",
    ASCENDING: "Ascending",
    DESCENDING: "Descending"
};

const filterlist = Object.values(filterItems);

State.init({
    filtersOpen: false,
    selectedView: viewTypes.CARD,
    viewModalOpen: false,
    filters: [],
    expandedTables: {},
    isLoading: false,
    search: "",
    filteredData: [],
    currentPage: currentPage
});

const Wrapper = styled.div`
    width: 98%;

    a {
        color: #4498e0;
        font-size: 0.8rem;
        font-weight: 600;
        text-decoration: none;

        &:hover {
            color: #4498e0cc;
        }
    }

    table {
        font-size: 14px;
        width: 100%;
        box-sizing: border-box;
    }

    th,
    td {
        padding: 15px;
        text-align: left;
    }

    tr {
        border-bottom: 1px solid lightgray;
    }

    thead {
        border-bottom: 2px solid #4498e0;
    }

    .icons-color i {
        color: #4498e0;
    }

    .danger i {
        color: rgb(229, 72, 77);
    }

    .card-view-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 1rem;
    }

    .justify-end {
        justify-content: end;
    }

    .text-gray {
        color: gray;
    }

    .word-wrap {
        word-break: break-word;
    }

    .gap-y-3 {
        row-gap: 1rem !important;
    }
`;

function followUser(user, isFollowing) {
    const dataToSend = {
        graph: { follow: { [user]: isFollowing ? null : "" } },
        index: {
            graph: JSON.stringify({
                key: "follow",
                value: {
                    type,
                    accountId: user
                }
            }),
            notify: JSON.stringify({
                key: user,
                value: {
                    type
                }
            })
        }
    };
    Social.set(dataToSend, {
        force: true
    });
}

const FollowBtn = ({ itemDetails }) => {
    return (
        <Widget
            src="nearui.near/widget/Input.Button"
            props={{
                children: itemDetails.isUserFollowed ? (
                    <span>
                        {state.selectedView !== viewTypes.CARD && "Unfollow"}{" "}
                        <i class="bi bi-person-dash"></i>
                    </span>
                ) : (
                    <span>
                        {state.selectedView !== viewTypes.CARD && "Follow"}
                        <i class="bi bi-person-plus"></i>
                    </span>
                ),
                variant:
                    (itemDetails.isUserFollowed ? "danger " : "info ") +
                    (state.selectedView === viewTypes.CARD && "icon ") +
                    " outline",
                onClick: () =>
                    followUser(itemDetails.account, itemDetails.isUserFollowed)
            }}
        />
    );
};

const Table = ({ tableData }) => {
    if (!tableData?.length > 0) {
        return null;
    }

    return (
        <div className="ndc-card icons-color my-4 p-4">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                    </tr>
                </thead>
                <tbody>
                    {tableData?.map((item) => {
                        return (
                            <tr className="word-wrap">
                                <td>
                                    <Widget
                                        src="mob.near/widget/Profile.ShortInlineBlock"
                                        props={{
                                            accountId: item.account,
                                            tooltip: true
                                        }}
                                    />
                                </td>
                                <td className="d-flex justify-end">
                                    <FollowBtn itemDetails={item} />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

const UIData =
    state.filters?.length > 0 || state.search ? state.filteredData : data;

const currentPageState =
    state.filters?.length > 0 || state.search ? 1 : state.currentPage;
let paginatedFollowers = [];

paginatedFollowers = UIData.slice(
    (currentPageState - 1) * resPerPage,
    currentPageState * resPerPage
);

return (
    <Wrapper>
        {data?.length === 0 ? (
            <p className="text-gray">
                This account doesn't have any followers yet.
            </p>
        ) : (
            <div className="d-flex flex-column gap-4">
                <div>
                    <h2 className="mb-1">Followers</h2>
                    <p className="text-gray">{data.length} followers</p>
                </div>
                <div className="d-flex gap-2 gap-y-3 flex-wrap">
                    <Widget
                        src="nearui.near/widget/Input.ExperimentalText"
                        props={{
                            value: state.search,
                            placeholder: "Search by name",
                            onChange: (value) => {
                                const filteredData = [...data];
                                if (value) {
                                    filteredData = filteredData?.filter(
                                        (item) => {
                                            const searchTerm =
                                                value.toLowerCase();
                                            return item.account.includes(
                                                searchTerm
                                            );
                                        }
                                    );
                                }
                                State.update({
                                    ...state,
                                    filteredData: filteredData,
                                    search: value
                                });
                            },
                            icon: (
                                <i
                                    className="bi bi-search"
                                    style={{
                                        color: "#4498e0 !important"
                                    }}
                                />
                            ),
                            inputProps: {
                                title: "Disabled because no API for searching yet"
                            }
                        }}
                    />
                    <div className="d-flex gap-2 flex-wrap">
                        <Widget
                            src="nearui.near/widget/Layout.Popover"
                            props={{
                                triggerComponent: (
                                    <Widget
                                        src="nearui.near/widget/Input.Button"
                                        props={{
                                            style: {
                                                color: "#4498e0"
                                            },
                                            children: (
                                                <>
                                                    {state.selectedView} View
                                                    <i class="bi bi-caret-down"></i>
                                                </>
                                            ),
                                            variant: "info outline ",
                                            size: "md",
                                            className: ""
                                        }}
                                    />
                                ),
                                content: (
                                    <Widget
                                        src="/*__@appAccount__*//widget/Common.Modals.ViewDropDown"
                                        props={{
                                            viewList: viewList,
                                            cancel: () => {
                                                State.update({
                                                    ...state,
                                                    selectedView: ""
                                                });
                                            },
                                            applyView: (selectedView) => {
                                                State.update({
                                                    ...state,
                                                    selectedView
                                                });
                                            },
                                            selectedView: state.selectedView
                                        }}
                                    />
                                )
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
                                            variant: "info",
                                            size: "md"
                                        }}
                                    />
                                ),
                                content: (
                                    <Widget
                                        src="/*__@appAccount__*//widget/Common.Modals.FiltersModal"
                                        props={{
                                            selectedFilters: state.filters,
                                            groupTypes: filterItems,
                                            cancel: () => {
                                                State.update({
                                                    ...state,
                                                    filters: [],
                                                    filtersOpen: false
                                                });
                                            },
                                            applyFilters: (filters) => {
                                                const filteredData = [...data];
                                                if (
                                                    filters?.includes(
                                                        filterItems.LATEST
                                                    )
                                                ) {
                                                    filteredData.sort(
                                                        (a, b) =>
                                                            b.blockHeight -
                                                            a.blockHeight
                                                    );
                                                }
                                                if (
                                                    filters?.includes(
                                                        filterItems.EARLIEST
                                                    )
                                                ) {
                                                    filteredData.sort(
                                                        (a, b) =>
                                                            a.blockHeight -
                                                            b.blockHeight
                                                    );
                                                }
                                                if (
                                                    filters?.includes(
                                                        filterItems.ASCENDING
                                                    )
                                                ) {
                                                    filteredData.sort((a, b) =>
                                                        a.account.localeCompare(
                                                            b.account
                                                        )
                                                    );
                                                }

                                                if (
                                                    filters?.includes(
                                                        filterItems.DESCENDING
                                                    )
                                                ) {
                                                    filteredData.sort((a, b) =>
                                                        b.account.localeCompare(
                                                            a.account
                                                        )
                                                    );
                                                }

                                                State.update({
                                                    ...state,
                                                    filters: filters,
                                                    filteredData: filteredData
                                                });
                                            },
                                            filterlist: filterlist
                                        }}
                                    />
                                )
                            }}
                        />
                    </div>
                </div>
                {state.isLoading ? (
                    <div>
                        <Widget src="nearui.near/widget/Feedback.Spinner" />
                    </div>
                ) : (
                    <div>
                        {state.selectedView === viewTypes.LIST && (
                            <Table tableData={paginatedFollowers} />
                        )}
                        {state.selectedView === viewTypes.CARD && (
                            <div className="card-view-grid">
                                {paginatedFollowers?.map((item) => {
                                    return (
                                        <div className="ndc-card p-4 d-flex flex-column gap-2">
                                            <div className="d-flex justify-content-between align-items-center gap-2">
                                                <div className="text-truncate w-75">
                                                    <Widget
                                                        src="mob.near/widget/Profile.ShortInlineBlock"
                                                        props={{
                                                            accountId:
                                                                item.account,
                                                            tooltip: true
                                                        }}
                                                    />
                                                </div>
                                                {accountId !== item.account && (
                                                    <FollowBtn
                                                        itemDetails={item}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        )}
        <div className="d-flex justify-content-center align-items-center gap-2 mt-2">
            <Widget
                src="nearui.near/widget/Navigation.Paginate"
                props={{
                    pageSize: resPerPage,
                    currentPage: state.currentPage,
                    totalPageCount: Math.ceil(UIData.length / resPerPage),
                    onPageChange: (page) => {
                        State.update({
                            currentPage: page
                        });
                    },
                    revaluateOnRender: true
                }}
            />
        </div>
    </Wrapper>
);
