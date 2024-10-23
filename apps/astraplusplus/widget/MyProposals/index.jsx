const baseApi = "https://api.pikespeak.ai/daos/proposals-by-proposer";
const publicApiKey = "/*__@replace:pikespeakApiKey__*/";
const resPerPage = 20;
const accountId = context.accountId;

const defaultMultiSelectMode = Storage.privateGet("multiSelectMode");
const defaultTableView = Storage.privateGet("tableView");

if (defaultMultiSelectMode === null) return "";
if (defaultTableView === null) return "";

State.init({
  page: 0,
  multiSelectMode: defaultMultiSelectMode ?? false,
  tableView: defaultTableView ?? false
});

const forgeUrl = (apiUrl, params) =>
  apiUrl +
  Object.keys(params)
    .sort()
    .reduce((paramString, p) => paramString + `${p}=${params[p]}&`, "?");

function fetchMyProposals() {
  const resp = fetch(
    forgeUrl(`${baseApi}/${context.accountId}`, {
      offset: state.page * resPerPage,
      limit: resPerPage,
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

const update = (newState) => State.update(newState);

let res = fetchMyProposals();

function hasNextHandler() {
  const hasNext = false;
  hasNext = resPerPage === res.body.length;
  return hasNext;
}

return (
  <>
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
    {res !== null && !res.body ? (
      <div className="alert alert-danger mt-2" role="alert">
        Network issue. Please try again later.
      </div>
    ) : (
      <>
        <div>
          {state.tableView ? (
            <Widget
              src="/*__@appAccount__*//widget/DAO.Proposals.Table.index"
              props={{
                state,
                resPerPage,
                proposals: res === null ? null : res.body
              }}
            />
          ) : (
            <Widget
              src="/*__@appAccount__*//widget/DAO.Proposals.CardsList"
              props={{
                state,
                resPerPage,
                proposals: res === null ? null : res.body,
                showNavButton: true
              }}
            />
          )}

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
                }
              }}
            />
          </>
        )}
      </>
    )}
  </>
);
