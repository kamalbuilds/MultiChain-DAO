/*__@import:daoHelpers/getFollowedDAOs__*/
const baseApi = "https://api.pikespeak.ai/daos/proposals";
const publicApiKey = "/*__@replace:pikespeakApiKey__*/";
const resPerPage = 20;
const accountId = context.accountId;

State.init({
  page: 0,
  filters: {
    proposal_status: [],
    time_start: "",
    time_end: "",
    dao_type: "all"
  },
  filtersOpen: false
});

let followedDAOs = null;
if (state.filters.dao_type === "followedDAOs") {
  followedDAOs = getFollowedDAOs(accountId);
  if (followedDAOs === null) return "";
}

const GDAOs = [
  "gaming-dao.sputnik-dao.near",
  "she-is-near.sputnik-dao.near",
  "build.sputnik-dao.near",
  "marketing.sputnik-dao.near",
  "research-collective.sputnik-dao.near",
  "ndc-degens.sputnik-dao.near",
  "onboarddao.sputnik-dao.near",
  "freelancerdao.sputnik-dao.near",
  "nearnftwg.sputnik-dao.near",
  "nearglobedao.sputnik-dao.near",
  "service-dao.sputnik-dao.near",
  "ndc-ops.sputnik-dao.near",
  "creativesdao.sputnik-dao.near"
];

const forgeUrl = (apiUrl, params) =>
  apiUrl +
  Object.keys(params)
    .sort()
    .reduce((paramString, p) => paramString + `${p}=${params[p]}&`, "?");

let daos = [
  "ndctrust.sputnik-dao.near",
  "shitzu.sputnik-dao.near",
  "orderly-ops.sputnik-dao.near",
  "ref-finance.sputnik-dao.near",
  "human.sputnik-dao.near",
  "marmaj.sputnik-dao.near",
  "cheddar.sputnik-dao.near",
  "orderly-ops.sputnik-dao.near"
];

function manageDaosFilter() {
  switch (state.filters.dao_type) {
    case "followedDAOs": {
      daos = followedDAOs;
      break;
    }
    case "myDAOs": {
      daos = useCache(
        () =>
          // TODO: need better API for this, fetching all members daos is not efficient
          asyncFetch(forgeUrl(`https://api.pikespeak.ai/daos/members`, {}), {
            mode: "cors",
            headers: {
              "x-api-key": publicApiKey
            }
          }).then((res) => {
            return res.body[accountId]["daos"] ?? [];
          }),
        "my-daos-feed" + accountId,
        { subscribe: false }
      );
      break;
    }
    case "GDAOs": {
      daos = GDAOs;
      break;
    }
    default: {
      daos = daos.concat(GDAOs);
      break;
    }
  }
}

manageDaosFilter();
const Content = () => {
  if (!(daos ?? [])?.length) {
    if (state.filters.dao_type === "followedDAOs") {
      return (
        <div class="alert alert-info mt-4" role="alert">
          You haven't followed any DAOs.
        </div>
      );
    }
    if (state.filters.dao_type === "myDAOs") {
      return (
        <div class="alert alert-info mt-4" role="alert">
          You are not a member of any DAOs.
        </div>
      );
    }
  } else {
    return (
      <div>
        {res !== null && !res.body ? (
          <div className="alert alert-danger mt-2" role="alert">
            Network issue. Please try again later.
          </div>
        ) : (
          <div>
            <Widget
              src="/*__@appAccount__*//widget/DAO.Proposals.CardsList"
              props={{
                state,
                resPerPage,
                proposals: res === null ? null : res.body,
                showNavButton: true
              }}
            />
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
          </div>
        )}
      </div>
    );
  }
};

function fetchProposals() {
  const resp = fetch(
    forgeUrl(baseApi, {
      daos: daos,
      offset: state.page * resPerPage,
      limit: resPerPage,
      status: state.filters.proposal_status,
      proposal_types: state.filters.proposal_types,
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

const update = (newState) => State.update(newState);

let res = null;

if ((daos ?? [])?.length > 0) {
  res = fetchProposals();
}

function hasNextHandler() {
  const hasNext = false;
  hasNext = resPerPage === res.body.length;
  return hasNext;
}

return (
  <>
    <div>
      <h3>Global Proposals Feed</h3>
    </div>
    <div
      className="d-flex align-items-center gap-2 flex-wrap-reverse justify-content-end"
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
              src="/*__@appAccount__*//widget/ProposalsFeed.FilterModal"
              props={{
                filters: state.filters,
                cancel: () => {
                  State.update({
                    ...state,
                    filtersOpen: false
                  });
                },
                applyFilters: (filters) => {
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
    <Content />
  </>
);
