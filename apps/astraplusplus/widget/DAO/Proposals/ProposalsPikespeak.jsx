const { daoId, proposals } = props;

const apiUrl = `https://api.pikespeak.ai/daos/proposals`;
const publicApiKey = "/*__@replace:pikespeakApiKey__*/";
const resPerPage = 30; // Number of proposals to fetch at a time
const accountId = context.accountId;

const defaultMultiSelectMode = Storage.privateGet("multiSelectMode");
const defaultTableView = Storage.privateGet("tableView");

if (defaultMultiSelectMode === null) return "";
if (defaultTableView === null) return "";

const CoADaoId = props.dev
  ? "/*__@replace:CoADaoIdTesting__*/"
  : "/*__@replace:CoADaoId__*/";
const VotingBodyDaoId = props.dev
  ? "/*__@replace:VotingBodyDaoIdTesting__*/"
  : "/*__@replace:VotingBodyDaoId__*/";
const TCDaoId = props.dev
  ? "/*__@replace:TCDaoIdTesting__*/"
  : "/*__@replace:TCDaoId__*/";
const HoMDaoId = props.dev
  ? "/*__@replace:HoMDaoIdTesting__*/"
  : "/*__@replace:HoMDaoId__*/";

const isCongressDaoID =
  daoId === HoMDaoId || daoId === CoADaoId || daoId === TCDaoId;

const isVotingBodyDao = daoId === VotingBodyDaoId;

const proposalsCount = Near.view(daoId, "number_of_proposals");

if (proposalsCount === null) return;
const STORAGE_FILTERS_KEY = daoId + "_filters";
const storageFiltersData = Storage.privateGet(STORAGE_FILTERS_KEY);
State.init({
  daoId,
  page: 0,
  filters: {
    proposal_types: [],
    status: [],
    voterStatus: "",
    time_start: "",
    time_end: ""
  },
  filtersOpen: false,
  multiSelectMode: defaultMultiSelectMode ?? false,
  tableView: defaultTableView ?? false,
  daoConfig: null,
  tab: "active",
  sputnikProposalsLastCount: null
});

if (
  storageFiltersData &&
  JSON.stringify(state.filters) !== storageFiltersData
) {
  State.update({
    filters: JSON.parse(storageFiltersData)
  });
}

function getPreVoteVotes(supported) {
  const votes = {};
  for (const item of supported) {
    votes[item] = "Support";
  }
  return votes;
}

// convert to the data structure required by proposals component (similar to pikespeak API)
function processProposals(proposals) {
  const parsedResp = [];
  proposals?.map((item) => {
    parsedResp.push({
      dao_id: daoId,
      last_updated: "",
      proposal: {
        id: item.id,
        kind: item.kind,
        votes:
          item.status === "PreVote"
            ? getPreVoteVotes(item.supported)
            : item.votes ?? {},
        status: item.status,
        proposer: item?.proposer,
        description: item.description,
        vote_counts: {},
        submission_time: item?.submission_time ?? item?.start, // for vb it's start
        supported: item?.supported ?? [], // for vb
        approve: item?.approve ?? 0,
        reject: item?.reject ?? 0,
        spam: item?.spam ?? 0,
        abstain: item?.abstain ?? 0,
        support: item?.support ?? 0
      },
      proposal_type: item?.kind,
      proposal_id: item.id,
      proposer: item?.proposer,
      status: item?.status,
      submission_time: item?.submission_time ?? item?.start,
      transaction_id: "",
      supported: item?.supported ?? [] // for vb
    });
  });

  return { body: parsedResp };
}

const update = (newState) => State.update(newState);

const forgeUrl = (apiUrl, params) =>
  apiUrl +
  Object.keys(params)
    .sort()
    .reduce((paramString, p) => paramString + `${p}=${params[p]}&`, "?");

function fetchCongressDaoProposals() {
  const data = [];
  const resp = Near.view(daoId, "get_proposals", {
    from_index:
      state.page === 0
        ? proposalsCount
        : proposalsCount - state.page * resPerPage,
    limit: resPerPage,
    reverse: true
  });

  if (resp) data = processProposals(resp);

  return data;
}

useEffect(() => {
  Near.asyncView(daoId, "get_last_proposal_id", {}).then((resp) => {
    State.update({ sputnikProposalsLastCount: resp - 1 });
  });
}, [daoId]);

function fetchDaoProposals() {
  const resp = fetch(
    forgeUrl(apiUrl, {
      offset: state.page * resPerPage,
      limit: resPerPage,
      daos: [daoId],
      proposal_types: state.filters.proposal_types,
      status: state.filters.status,
      time_start: state.filters.time_start,
      time_end: state.filters.time_end
    }),
    {
      mode: "cors",
      headers: {
        "x-api-key": publicApiKey
      }
    }
  );

  return resp;
}

function fetchVBPreVoteProposals() {
  const data = [];
  const resp = Near.view(daoId, "get_pre_vote_proposals", {
    from_index:
      state.page === 0
        ? proposalsCount
        : proposalsCount - state.page * resPerPage,
    limit: resPerPage,
    reverse: true
  });

  if (resp) {
    data = processProposals(resp);
  }
  return data;
}

let res =
  proposals ??
  (isCongressDaoID || isVotingBodyDao
    ? fetchCongressDaoProposals()
    : fetchDaoProposals());

// filtering for congress daos
if (isCongressDaoID || isVotingBodyDao) {
  if (state.filters.voterStatus) {
    res.body = res.body?.filter((item) => {
      const showVoted = state.filters.voterStatus === "Voted";
      const hasVoted = Object.keys(item.proposal.votes).includes(accountId);
      return showVoted ? hasVoted : !hasVoted;
    });
  }

  if (state.filters.proposal_types?.length > 0) {
    res.body = res.body?.filter((item) => {
      const type =
        typeof item.proposal_type === "string"
          ? item.proposal_type
          : Object.keys(item.proposal_type)[0];
      return state.filters.proposal_types.includes(type);
    });
  }
  if (state.filters.status?.length > 0) {
    res.body = res.body?.filter((item) =>
      state.filters.status.includes(item.status)
    );
    // fetch pre vote proposals
    if (state.filters.status?.includes("PreVote") && isVotingBodyDao) {
      const data = fetchVBPreVoteProposals();
      res.body.push(...data.body);
    }
  }
}

if (isVotingBodyDao) {
  if (state.tab === "draft") {
    res = fetchVBPreVoteProposals();
  } else {
    res = fetchCongressDaoProposals();
  }
}

function hasNextHandler() {
  const hasNext = false;
  if (isCongressDaoID || isVotingBodyDao) {
    hasNext =
      state.page === 0
        ? proposalsCount > resPerPage
        : proposalsCount > state.page * resPerPage;
  } else {
    hasNext = resPerPage === res.body.length;
  }

  return hasNext;
}

function getDaoConfig() {
  if (isCongressDaoID || isVotingBodyDao) {
    const daoConfig = Near.view(daoId, "config", {});
    State.update({ daoConfig });
  }
}

getDaoConfig();

return (
  <div className="p-2 p-sm-0">
    <div
      className="d-flex align-items-center gap-2 flex-wrap"
      id="proposals-top"
    >
      <Widget
        src="nearui.near/widget/Input.Text"
        props={{
          placeholder: "Search by proposal ID or name",
          disabled: true,
          type,
          size,
          icon: (
            <i
              className="bi bi-search"
              style={{
                color: "#4F46E5"
              }}
            />
          ),
          inputProps: {
            title: "Disabled because no API for searching yet"
          }
        }}
      />
      <Widget
        src="nearui.near/widget/Input.Button"
        props={{
          children: state.multiSelectMode ? (
            <>
              Multi-Vote
              <i class="bi bi-x-lg"></i>
            </>
          ) : (
            <>
              Multi-Vote
              <i class="bi bi-card-checklist"></i>
            </>
          ),
          variant: "info outline",
          size: "md",
          onClick: () => {
            Storage.privateSet("multiSelectMode", !state.multiSelectMode);
            State.update({
              ...state,
              multiSelectMode: !state.multiSelectMode
            });
          }
        }}
      />
      <div className="d-none d-sm-flex">
        <Widget
          src="nearui.near/widget/Input.Button"
          props={{
            children: (
              <>
                Table View
                {state.tableView ? (
                  <i className="bi bi-x-lg"></i>
                ) : (
                  <i className="bi bi-table"></i>
                )}
              </>
            ),
            variant: "info outline",
            size: "md",
            onClick: () => {
              Storage.privateSet("tableView", !state.tableView);
              State.update({
                ...state,
                tableView: !state.tableView
              });
            }
          }}
        />
      </div>
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
          modalWidth: "1000px",
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
                variant: "info outline",
                size: "md"
              }}
            />
          ),
          content: (
            <Widget
              src="/*__@appAccount__*//widget/DAO.Proposals.FilterModal"
              props={{
                filters: state.filters,
                cancel: () => {
                  Storage.privateSet(STORAGE_FILTERS_KEY, null);
                  State.update({
                    ...state,
                    filtersOpen: false
                  });
                },
                applyFilters: (filters) => {
                  Storage.privateSet(
                    STORAGE_FILTERS_KEY,
                    JSON.stringify(filters)
                  );
                  State.update({
                    ...state,
                    filters,
                    filtersOpen: false
                  });
                },
                daoId
              }}
            />
          )
        }}
      />
    </div>
    {res !== null && !res.body ? (
      <div className="alert alert-danger mt-2" role="alert">
        Network issue. Please try again later.
      </div>
    ) : (
      <>
        {!state.filters.proposal_types.length &&
          !state.filters.status.length &&
          res?.body?.[0] &&
          res.body[0].proposal_id < state.sputnikProposalsLastCount && (
            <div className="alert alert-danger mt-4" role="alert">
              The Pikespeak indexer is currently delayed. New proposals have
              been created, so please check back later for an updated proposals
              feed.
            </div>
          )}
        {isVotingBodyDao && (
          <div className="w-100 mt-2">
            <Widget
              src={`/*__@appAccount__*//widget/DAO.Layout.Tabs`}
              props={{
                allowHref: false,
                tabs: {
                  active: {
                    name: "Active"
                  },
                  draft: {
                    name: "Draft"
                  }
                },
                tab: state.tab,
                update: (state) => update(state)
              }}
            />
          </div>
        )}
        <div className="d-none d-sm-block">
          {state.tableView ? (
            <Widget
              src="/*__@appAccount__*//widget/DAO.Proposals.Table.index"
              props={{
                state,
                resPerPage,
                proposals: res === null ? null : res.body,
                isCongressDaoID,
                isVotingBodyDao,
                daoConfig: state.daoConfig,
                dev: props.dev
              }}
            />
          ) : (
            <Widget
              src="/*__@appAccount__*//widget/DAO.Proposals.CardsList"
              props={{
                state,
                resPerPage,
                proposals: res === null ? null : res.body,
                isCongressDaoID,
                isVotingBodyDao,
                daoConfig: state.daoConfig,
                dev: props.dev
              }}
            />
          )}
        </div>

        <div className="d-block d-sm-none">
          <Widget
            src="/*__@appAccount__*//widget/DAO.Proposals.CardsList"
            props={{
              state,
              resPerPage,
              proposals: res === null ? null : res.body,
              isCongressDaoID,
              isVotingBodyDao,
              daoConfig: state.daoConfig,
              dev: props.dev
            }}
          />
        </div>

        <div className="d-flex justify-content-center my-4">
          <Widget
            src="nearui.near/widget/Navigation.PrevNext"
            props={{
              hasPrev: state.page > 0,
              hasNext: hasNextHandler(),
              onPrev: () => {
                update({
                  page: state.page - 1
                });
              },
              onNext: () => {
                update({
                  page: state.page + 1
                });
              },
              nextHref: `#proposals-top`
            }}
          />
        </div>

        {state.multiSelectMode && (
          <>
            <div
              style={{
                height: 180,
                width: "100%"
              }}
            ></div>
            <Widget
              src="/*__@appAccount__*//widget/DAO.Proposals.MultiVote"
              props={{
                daoId: state.daoId,
                view: "submit",
                onHideMultiSelect: () => {
                  State.update({
                    ...state,
                    multiSelectMode: false
                  });
                  Storage.privateSet("multiSelectMode", false);
                },
                isCongressDaoID,
                isVotingBodyDao,
                dev: props.dev
              }}
            />
          </>
        )}
      </>
    )}
  </div>
);
