let votes = props.votes;
const daoId = props.daoId;
const isCongressDaoID = props.isCongressDaoID;
const isVotingBodyDao = props.isVotingBodyDao;
const proposalId = props.proposalId;
const QUERYAPI_ENDPOINT = `https://near-queryapi.api.pagoda.co/v1/graphql/`;
const votersCount = props.votersCount;

const query = `query MyQuery {
    strachu_near_vb_prod_v2_vote(where: {proposal_id: {_eq: ${proposalId}}}) {
      vote
      voter
      timestamp
    }
  }`;

function fetchGraphQL(operationsDoc, operationName, variables) {
  return asyncFetch(QUERYAPI_ENDPOINT, {
    method: "POST",
    headers: { "x-hasura-role": "strachu_near" },
    body: JSON.stringify({
      query: operationsDoc,
      variables: variables,
      operationName: operationName
    })
  });
}

if (isVotingBodyDao) {
  votes = useCache(
    () =>
      fetchGraphQL(query, "MyQuery", {}).then((result) => {
        const parsedData = {};
        if (result.status === 200) {
          if (result.body.data) {
            const data = result.body.data["strachu_near_vb_prod_v2_vote"];

            if (data?.length > 0) {
              for (const a of data) {
                parsedData[a.voter] = {
                  timestamp: a.timestamp,
                  vote: a.vote
                };
              }
            }
          }
        }
        return parsedData;
      }),
    daoId + "proposals" + proposalId,
    { subscribe: false }
  );
}

const Wrapper = styled.ul`
  overflow: hidden;
  padding: 24px;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;

  .radius {
    border-radius: 14px;
  }

  li {
    display: flex;
    flex-direction: column;
    padding: 12px;
    gap: 10px;
    border-radius: 14px;
  }

  div.Approve {
    background-color: #59e69220;
    .vote {
      color: #0d562b;
    }
  }
  div.Reject {
    background-color: #e5484d20;
    .vote {
      color: #bf2c30;
    }
  }
  div.Abstain {
    background-color: #d3d3d3;
    .vote {
      color: black;
    }
  }
  div.Spam {
    background-color: #ffda0920;
    .vote {
      color: #73692d;
    }
  }
  div.Remove {
    background-color: #ffda0920;
    .vote {
      color: #73692d;
    }
  }
`;

return (
  <Wrapper>
    {Object.keys(votes).length === 0 && (
      <span className="text-muted text-center">No votes yet</span>
    )}
    {isCongressDaoID &&
      isVotingBodyDao &&
      votersCount > Object.keys(votes).length && (
        <div>
          Note: Indexer is currently running behind schedule, and the expected
          results may take longer to appear. We appreciate your patience and
          apologize for any inconvenience.
        </div>
      )}
    {Object.keys(votes).map((voterId) => {
      const vote =
        isCongressDaoID || isVotingBodyDao
          ? votes[voterId].vote
          : votes[voterId];
      return (
        <div className={vote + " radius"}>
          <li className={vote}>
            <div className="d-flex items-center justify-content-between">
              <div className="text-truncate w-70">
                <Widget
                  src="mob.near/widget/Profile.ShortInlineBlock"
                  props={{
                    accountId: voterId,
                    tooltip: true
                  }}
                />
              </div>
              <div className="w-30">
                <Widget
                  src="/*__@replace:nui__*//widget/Element.Badge"
                  props={{
                    children: <span className="vote">{vote}</span>,
                    variant: `round`,
                    size: "md"
                  }}
                />
              </div>
            </div>
            {((isCongressDaoID && votes[voterId].timestamp > 0) ||
              isVotingBodyDao) &&
              votes[voterId].timestamp && (
                <div className="d-flex gap-2">
                  <small>
                    <i className="bi bi-clock" />
                  </small>
                  <small className="text-secondary">
                    {new Date(votes[voterId].timestamp).toLocaleString()}
                  </small>
                </div>
              )}
          </li>
        </div>
      );
    })}
  </Wrapper>
);
