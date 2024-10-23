const applyFilters = props.applyFilters;
const cancel = props.cancel;
const daoId = props.daoId;

const filters = props.filters ?? {
  proposal_status: [],
  time_start: "",
  time_end: "",
  dao_type: ""
};

State.init({
  filters
});

const setFilters = (f) => {
  State.update({
    filters: f
  });
};

const DaoTypes = [
  {
    title: "My Daos",
    value: "myDAOs"
  },
  {
    title: "Followed",
    value: "followedDAOs"
  },
  {
    title: "Grassroot DAOs",
    value: "GDAOs"
  },
  {
    title: "All",
    value: "all"
  }
];

const ProposalStatus = [
  {
    title: "Approved",
    value: "Approved"
  },
  {
    title: "Rejected",
    value: "Rejected"
  },
  {
    title: "In Progress",
    value: "InProgress"
  },
  {
    title: "Expired",
    value: "Expired"
  },
  {
    title: "Failed",
    value: "Failed"
  },
  {
    title: "Executed",
    value: "Executed"
  }
];

const Wrapper = styled.div`
  .check-subtitle {
    font-size: 12px;
    font-weight: 500;
    color: #999;
    padding: 0 !important;
  }

  .category-title {
    margin: 0px;
    font-size: 14px;
    font-weight: 500;
    color: #999;
    text-transform: capitalize;
    margin-bottom: 6px;
  }

  .filter-title {
    font-style: normal;
    font-weight: 600;
    font-size: 15px;
    line-height: 1.25em;
    color: #222;
    margin-bottom: 12px;
  }

  .cursor-pointer {
    cursor: pointer;
  }
`;

return (
  <Wrapper className="ndc-card p-5 pb-4">
    <h4 className="filter-title">DAOs: </h4>
    <div className="d-flex flex-wrap gap-3">
      {DaoTypes.map((item) => {
        return (
          <div
            onClick={(e) =>
              setFilters({
                ...state.filters,
                dao_type:
                  state.filters.dao_type === item.value ? "" : item.value
              })
            }
            className="d-flex gap-2 align-items-center cursor-pointer"
          >
            <input
              className="form-check-input"
              type="radio"
              value={item.value}
              checked={state.filters.dao_type === item.value || false}
            />
            <span className="label">{item.title}</span>
          </div>
        );
      })}
    </div>
    <h4 className="filter-title mt-4">Proposal status: </h4>
    <div className="d-flex flex-wrap">
      {ProposalStatus.map((item) => {
        return (
          <Widget
            src="nearui.near/widget/Input.Checkbox"
            props={{
              checked:
                state.filters.proposal_status.includes(item.value) || false,
              onChange: (checked) => {
                setFilters({
                  ...state.filters,
                  proposal_status: checked
                    ? [...state.filters.proposal_status, item.value]
                    : state.filters.proposal_status.filter(
                        (x) => x !== item.value
                      )
                });
              },
              label: item.title
            }}
          />
        );
      })}
    </div>
    <div className="d-flex gap-3 mt-4  flex-wrap">
      <Widget
        src="nearui.near/widget/Input.Text"
        props={{
          value: state.filters.time_start,
          onChange: (value) => {
            setFilters({
              ...state.filters,
              time_start: value
            });
          },
          label: "From Date",
          inputProps: {
            type: "date"
          }
        }}
      />
      <Widget
        src="nearui.near/widget/Input.Text"
        props={{
          value: state.filters.time_end,
          onChange: (value) => {
            setFilters({
              ...state.filters,
              time_end: value
            });
          },
          label: "To Date",
          inputProps: {
            type: "date"
          }
        }}
      />
    </div>
    <div className="d-flex justify-content-end mt-5 gap-3">
      <Widget
        src="nearui.near/widget/Input.Button"
        props={{
          children: "Cancel",
          onClick: () => {
            cancel();
          },
          variant: "secondary outline",
          className: "me-auto"
        }}
      />
      <Widget
        src="nearui.near/widget/Input.Button"
        props={{
          children: "Clear",
          onClick: () => {
            setFilters({
              proposal_status: [],
              time_start: "",
              time_end: ""
            });
          },
          variant: "secondary outline"
        }}
      />
      <Widget
        src="nearui.near/widget/Input.Button"
        props={{
          children: "Apply",
          onClick: () => {
            applyFilters(state.filters);
          },
          variant: "secondary"
        }}
      />
    </div>
  </Wrapper>
);
