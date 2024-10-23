const daoId = props.daoId;
const proposal = props.proposal;
const kind = props.kind ?? proposal.kind;
const showCard = props.showCard ?? false;

if (!kind) return "";

function convertMillisecondsToDaysAndHours(milliseconds) {
  const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
  const days = Math.floor(milliseconds / oneDayInMilliseconds);
  const remainingHours =
    (milliseconds % oneDayInMilliseconds) / (60 * 60 * 1000);

  return `${days} days and ${remainingHours} hours`;
}

const proposal_type = typeof kind === "string" ? kind : Object.keys(kind)?.[0];

const Wrapper = styled.div`
  h5 {
    color: gray;
    font-size: 14px;
    margin-bottom: 0.5em;
  }

  .ndc-card h5 {
    font-size: 1.1em;
    color: #555;
    margin-bottom: 0.4em;
  }

  pre {
    margin-bottom: 0;

    div {
      border-radius: 5px;
    }
  }
`;

const MarkdownContainer = styled.div`
  position: relative;
  width: 100%;
  padding: 24px;
  background-color: #f8f9fa;
  color: #1b1b18;
  border-radius: 14px;
  max-height: 700px;
  overflow-y: auto;
  color: #333;
  line-height: 1.6;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 0px 0px 1px;

  h1 {
    font-size: 2em;
    color: #111;
    border-bottom: 1px solid #ccc;
    padding-bottom: 0.3em;
    margin-bottom: 1em;
  }

  h2 {
    font-size: 1.5em;
    color: #222;
    margin-bottom: 0.75em;
  }

  h3 {
    font-size: 1.3em;
    color: #333;
    margin-bottom: 0.6em;
  }

  h4 {
    font-size: 1.2em;
    color: #444;
    margin-bottom: 0.5em;
  }

  h5 {
    font-size: 1.1em;
    color: #555;
    margin-bottom: 0.4em;
  }

  p {
    font-size: 1em;
    margin-bottom: 1em;
  }

  a {
    color: #0645ad;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
`;

const content = null;

if (proposal_type === "DismissAndBan") {
  content = (
    <>
      <div>
        <b>Member</b>
        <Widget
          src="mob.near/widget/Profile.ShortInlineBlock"
          props={{
            accountId: kind.DismissAndBan.member,
            tooltip: true
          }}
        />
      </div>
      <div>
        <b>House</b>
        <Widget
          src="mob.near/widget/Profile.ShortInlineBlock"
          props={{
            accountId: kind.DismissAndBan.house,
            tooltip: true
          }}
        />
      </div>
    </>
  );
}

if (proposal_type === "ApproveBudget" || proposal_type === "Veto") {
  content = (
    <>
      <div>
        <b>Proposal ID</b>
        <p>{kind[proposal_type].prop_id}</p>
      </div>
      <div>
        <b>House</b>
        <p>
          <Widget
            src="mob.near/widget/Profile.ShortInlineBlock"
            props={{
              accountId: kind[proposal_type].dao,
              tooltip: true
            }}
          />
        </p>
      </div>
    </>
  );
}

if (proposal_type === "Dismiss") {
  content = (
    <>
      <div>
        <b>Member</b>
        <Widget
          src="mob.near/widget/Profile.ShortInlineBlock"
          props={{
            accountId: kind.Dismiss.member,
            tooltip: true
          }}
        />
      </div>
      <div>
        <b>House</b>
        <Widget
          src="mob.near/widget/Profile.ShortInlineBlock"
          props={{
            accountId: kind.Dismiss.dao,
            tooltip: true
          }}
        />
      </div>
    </>
  );
}

if (proposal_type === "Dissolve") {
  content = (
    <>
      <div>
        <b>House</b>
        <Widget
          src="mob.near/widget/Profile.ShortInlineBlock"
          props={{
            accountId: kind.Dissolve.dao,
            tooltip: true
          }}
        />
      </div>
    </>
  );
}

if (proposal_type === "Transfer")
  content = (
    <>
      <div>
        <b>Amount</b>
        <div>
          <Widget
            src="/*__@appAccount__*//widget/Common.Components.TokenAmount"
            props={{
              amountWithoutDecimals: kind.Transfer.amount,
              address: kind.Transfer.token_id
            }}
          />
        </div>
      </div>
      <div>
        <b>Receiver</b>
        <div>
          <Widget
            src="mob.near/widget/Profile.ShortInlineBlock"
            props={{
              accountId: kind.Transfer.receiver_id,
              tooltip: true
            }}
          />
        </div>
      </div>
    </>
  );

if (
  proposal_type === "RecurrentFundingRequest" ||
  proposal_type === "FundingRequest"
)
  content = (
    <>
      <div>
        <b>Amount</b>
        <div>
          <Widget
            src="/*__@appAccount__*//widget/Common.Components.TokenAmount"
            props={{
              amountWithoutDecimals: kind[proposal_type],
              address: kind.Transfer.token_id
            }}
          />
        </div>
      </div>
    </>
  );

if (proposal_type === "UpdateBonds")
  content = (
    <>
      <div>
        <b>Pre Vote Bond Amount</b>
        <div>
          <Widget
            src="/*__@appAccount__*//widget/Common.Components.TokenAmount"
            props={{
              amountWithoutDecimals: kind[proposal_type].pre_vote_bond,
              address: ""
            }}
          />
        </div>
      </div>
      <div>
        <b>Active Queue Bond Amount</b>
        <div>
          <Widget
            src="/*__@appAccount__*//widget/Common.Components.TokenAmount"
            props={{
              amountWithoutDecimals: kind[proposal_type].active_queue_bond,
              address: ""
            }}
          />
        </div>
      </div>
    </>
  );

if (proposal_type === "UpdateVoteDuration")
  content = (
    <>
      <div>
        <b>Pre Vote Duration</b>
        <div>
          {convertMillisecondsToDaysAndHours(
            kind[proposal_type].pre_vote_duration
          ) ?? 0}
        </div>
      </div>
      <div>
        <b>Vote Duration</b>
        <div>
          {convertMillisecondsToDaysAndHours(
            kind[proposal_type].vote_duration ?? 0
          )}
        </div>
      </div>
    </>
  );

if (proposal_type === "FunctionCall") {
  content = (
    <>
      {kind.FunctionCall.actions.reduce(
        (acc, { method_name, args, deposit }) => {
          return acc.concat(
            <div className="d-flex flex-wrap align-items-start w-100 gap-2">
              <div className="info_section">
                <b>Smart Contract Address</b>
                <div>
                  <small className="text-muted">
                    {kind.FunctionCall.receiver_id}
                  </small>
                </div>
              </div>
              <div className="info_section">
                <b>Method Name</b>
                <div>
                  <small className="text-muted">{method_name}</small>
                </div>
              </div>

              <div className="info_section no-border">
                <b>Deposit</b>
                <div style={{ zoom: 0.7 }}>
                  <Widget
                    src="/*__@appAccount__*//widget/Common.Components.TokenAmount"
                    props={{
                      amountWithoutDecimals: deposit,
                      address: ""
                    }}
                  />
                </div>
              </div>
              <div className="w-100">
                <b>Arguments</b>
                <Markdown
                  // Decode the args (Base64) to String then Parse the Json then format it and display it as markdown code
                  text={
                    "```json\n" +
                    JSON.stringify(
                      JSON.parse(Buffer.from(args, "base64").toString("utf8")),
                      null,
                      2
                    ) +
                    "\n```"
                  }
                />
              </div>
            </div>
          );
        },
        []
      )}
    </>
  );
}

if (
  proposal_type === "AddMemberToRole" ||
  proposal_type === "RemoveMemberFromRole"
)
  content = (
    <>
      <div>
        <b>Member</b>
        <Widget
          src="mob.near/widget/Profile.ShortInlineBlock"
          props={{
            accountId: kind[proposal_type].member_id,
            tooltip: true
          }}
        />
      </div>
      <div>
        <b>Role</b>
        <p>{kind[proposal_type].role}</p>
      </div>
    </>
  );

if (proposal_type === "AddBounty")
  content = (
    <>
      <div>
        <b>Amount</b>
        <div>
          <Widget
            src="/*__@appAccount__*//widget/Common.Components.TokenAmount"
            props={{
              amountWithoutDecimals: kind.AddBounty.bounty.amount,
              address: kind.AddBounty.bounty.token
            }}
          />
        </div>
      </div>
      <div>
        <b>Times</b>
        <p>{kind.AddBounty.bounty.times}</p>
      </div>
      <div>
        <b>Deadline</b>
        <p>{new Date(kind.AddBounty.bounty.max_deadline).toLocaleString()}</p>
      </div>
      <div className="w-100">
        <b>Bounty Description</b>
        <MarkdownContainer>
          <Markdown text={kind.AddBounty.bounty.description} />
        </MarkdownContainer>
      </div>
    </>
  );

if (proposal_type === "BountyDone")
  content = (
    <>
      <div>
        <b>Receiver</b>
        <Widget
          src="mob.near/widget/Profile.ShortInlineBlock"
          props={{
            accountId: kind.BountyDone.receiver_id,
            tooltip: true
          }}
        />
      </div>
      <div>
        <b>Bounty ID</b>
        <p>{kind.BountyDone.bounty_id}</p>
      </div>
    </>
  );

function deepSortObject(obj) {
  if (typeof obj !== "object" || obj === null) {
    // Return non-object values as is
    return obj;
  }

  if (Array.isArray(obj)) {
    // If the input is an array, recursively sort each element
    return obj.map(deepSortObject).sort();
  }

  const sortedObject = {};
  const sortedKeys = Object.keys(obj).sort((keyA, keyB) => {
    // Compare keys in a case-insensitive manner
    return keyA.toLowerCase().localeCompare(keyB.toLowerCase());
  });

  for (const key of sortedKeys) {
    sortedObject[key] = deepSortObject(obj[key]);
  }

  return sortedObject;
}

// TODO: ChangePolicy component need some UI improvements to be more readable
if (proposal_type === "ChangePolicy") {
  const old_policy = Near.view(daoId, "get_policy");
  if (old_policy === null) return "";
  content = (
    <>
      <div className="w-100">
        <b>Policy Changes</b>
        <div
          className="w-100"
          style={{
            maxHeight: "400px",
            overflow: "auto"
          }}
        >
          <Widget
            src="bozon.near/widget/CodeDiff"
            props={{
              prevCode: JSON.stringify(deepSortObject(old_policy), null, 2),
              currentCode: JSON.stringify(
                deepSortObject(kind.ChangePolicy.policy),
                null,
                2
              )
            }}
          />
        </div>
      </div>
    </>
  );
}

if (proposal_type === "ChangeConfig") {
  const old_config = Near.view(daoId, "get_config");
  if (old_config === null) return "";
  content = (
    <>
      <div className="w-100">
        <b>Config Changes</b>
        <div
          className="w-100"
          style={{
            maxHeight: "400px",
            overflow: "auto"
          }}
        >
          <Widget
            src="bozon.near/widget/CodeDiff"
            props={{
              prevCode: JSON.stringify(deepSortObject(old_config), null, 2),
              currentCode: JSON.stringify(
                deepSortObject(kind.ChangeConfig.config),
                null,
                2
              )
            }}
          />
        </div>
      </div>
    </>
  );
}

if (proposal_type === "ChangePolicyUpdateParameters") {
  const old_policy = Near.view(daoId, "get_policy");
  if (old_policy === null) return "";
  delete old_policy["roles"];
  delete old_policy["default_vote_policy"];
  content = (
    <>
      <div className="w-100">
        <b>Policy Parameters Changes</b>
        <div
          className="w-100"
          style={{
            maxHeight: "400px",
            overflow: "auto"
          }}
        >
          <Widget
            src="bozon.near/widget/CodeDiff"
            props={{
              prevCode: JSON.stringify(deepSortObject(old_policy), null, 2),
              currentCode: JSON.stringify(
                deepSortObject(kind.ChangePolicyUpdateParameters.parameters),
                null,
                2
              )
            }}
          />
        </div>
      </div>
    </>
  );
}

return (
  <>
    {content && (
      <Wrapper className={showCard && "ndc-card p-4"}>
        <div
          className={
            "d-flex flex-wrap " + (showCard ? " align-items-start " : "gap-5")
          }
          style={
            showCard
              ? {
                  rowGap: "16px",
                  columnGap: "48px"
                }
              : {}
          }
        >
          {content}
        </div>
      </Wrapper>
    )}
  </>
);
