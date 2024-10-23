const view = props.view ?? "multiVote";
const isCongressDaoID = props.isCongressDaoID;
const isVotingBodyDao = props.isVotingBodyDao;
const registry = props.dev
  ? "/*__@replace:RegistryIdTesting__*/"
  : "/*__@replace:RegistryId__*/";
const daoId = props.daoId;

const STORAGE_KEY = "proposalsMultiVote";
const STORAGE = Storage.get(STORAGE_KEY);

if (view === "submit") {
  State.init({
    openModal: false,
    page: 0
  });

  if (STORAGE === null) return "";
  const onHideMultiSelect = props.onHideMultiSelect;

  const noVotes = Object.keys(STORAGE[daoId] || {}).length < 1;

  const proposal_ids = Object.keys(STORAGE[daoId] || {}).map((id) =>
    parseInt(id)
  );

  const handleSubmit = () => {
    const calls = [];
    Object.keys(STORAGE[daoId]).forEach((id) => {
      let vote = STORAGE[daoId][id];
      switch (`${vote}`) {
        case "0":
          vote = "VoteApprove";
          break;
        case "1":
          vote = "VoteReject";
          break;
        case "2":
          vote =
            isCongressDaoID || isVotingBodyDao ? "VoteAbstain" : "VoteRemove";
          break;
        case "3":
          vote = "VoteSpam";
          break;
        default:
          console.error("Invalid vote");
          break;
      }
      let args = {};
      if (isVotingBodyDao) {
        args["prop_id"] = parseInt(id);
        args["caller"] = accountId;
        args["vote"] = vote.replace("Vote", "");
        calls.push({
          contractName: registry,
          methodName: "is_human_call",
          args: {
            ctr: daoId,
            function: "vote",
            payload: JSON.stringify(args)
          },
          gas: 200000000000000,
          deposit: 20000000000000000000000
        });
      } else {
        args["id"] = parseInt(id);
        if (isCongressDaoID) {
          args["vote"] = vote.replace("Vote", "");
        } else {
          args["action"] = vote;
        }
        calls.push({
          contractName: daoId,
          methodName: isCongressDaoID ? "vote" : "act_proposal",
          args: args,
          gas: 300000000000000
        });
      }
    });
    return Near.call(calls);
  };

  let Wrapper = styled.div`
    position: fixed;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    min-width: 500px;
    max-width: 100vw;
    background-color: #fff;
  `;

  const indexToVote = (i) => {
    if (i === "0") return "Yes";
    if (i === "1") return "No";
    if (i === "2")
      return isCongressDaoID || isVotingBodyDao ? "Abstain" : "Spam";
    if (i === "2") return "Spam";
  };
  return (
    <Wrapper className="ndc-card p-4">
      <h4>Voting on multiple proposals</h4>
      <p>
        {Object.keys(STORAGE[daoId] || {})
          .map((id) => parseInt(id))
          .map((id) => "#" + id + ": " + indexToVote(STORAGE[daoId][id]))
          .reverse()
          .join(", ")}
      </p>
      <div className="d-flex justify-content-end mt-4 gap-3">
        <Widget
          src="nearui.near/widget/Input.Button"
          props={{
            children: "Cancel",
            onClick: () => {
              onHideMultiSelect();
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
              Storage.set(STORAGE_KEY, {});
            },
            variant: "secondary outline"
          }}
        />
        <Widget
          src="nearui.near/widget/Input.Button"
          props={{
            children: "Submit",
            onClick: () => {
              handleSubmit();
            },
            variant: "secondary"
          }}
        />
      </div>
    </Wrapper>
  );
}

const proposal = props.proposal;
const canVote = props.canVote;
const selectedVote = STORAGE[daoId][proposal.id];

const handleClick = (e) => {
  const [proposalId, vote] = e.target.value.split(",");

  // using Storage.privateSet instead of State to avoid re-rendering everything
  // using daoId as key so that the storage doesn't grow indefinitely
  Storage.set(STORAGE_KEY, {
    [daoId]: {
      ...STORAGE[daoId],
      [proposalId]: vote
    }
  });
};

const Wrapper = styled.div`
  .form-check {
    padding: 6px 14px;
    border-radius: 16px;
    color: #000;
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;
    cursor: pointer;

    &.disabled {
      cursor: not-allowed !important;
      opacity: 0.7;

      span {
        cursor: not-allowed !important;
      }
    }

    input {
      margin: 0 !important;
    }

    span {
      flex: 1;
      font-weight: 600;
      cursor: pointer;
    }

    &:first-child {
      background-color: #82e29930;

      &.active {
        background-color: #82e299;
      }
    }
    &:nth-child(2) {
      background-color: #ff646430;

      &.active {
        background-color: #ff6464;
      }
    }
    &:nth-child(3) {
      background-color: #ffd50d30;

      &.active {
        background-color: #ffd50d;
      }
    }
    &:nth-child(4) {
      background-color: #edeef5;

      &.active {
        background-color: #c5c6d0;
      }
    }
  }
`;

const allowedMethods = isVotingBodyDao
  ? ["Yes", "No", "Abstain", "Spam"]
  : isCongressDaoID
  ? ["Yes", "No", "Abstain"]
  : ["Yes", "No", "Spam"];
return (
  <Wrapper className="d-flex gap-1" {...(props.containerProps || {})}>
    {allowedMethods.map((option, index) => {
      return (
        <label
          key={index}
          className={`form-check flex-fill ${
            Number(selectedVote) === index ? "active" : ""
          } ${canVote ? "" : "disabled"}`}
          htmlFor={`vote-p-${proposal.id}-${index}`}
        >
          <input
            className="form-check-input"
            type="radio"
            value={[proposal.id, index]}
            id={`vote-p-${proposal.id}-${index}`}
            checked={Number(selectedVote) === index}
            onClick={handleClick}
            disabled={!canVote}
          />
          <span className="form-check-label">{option}</span>
        </label>
      );
    })}
  </Wrapper>
);
