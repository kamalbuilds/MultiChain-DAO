const {
  proposals,
  resPerPage,
  state,
  update,
  isCongressDaoID,
  daoConfig,
  isVotingBodyDao,
  showNavButton
} = props;

return (
  <div>
    {proposals === null && state.multiSelectMode && (
      <>
        {new Array(resPerPage).fill(0).map((_, i) => (
          <Widget src="astraplusplus.ndctools.near/widget/DAO.Proposals.Card.skeleton" />
        ))}
      </>
    )}
    {proposals !== null &&
      proposals.map(({ proposal, proposal_type, proposal_id, dao_id }, i) => {
        if (!isCongressDaoID && !isVotingBodyDao) {
          proposal.kind = {
            [proposal_type]: {
              ...proposal.kind
            }
          };
        }

        proposal.id = proposal_id;
        if (proposal.status === "Removed") return <></>;
        return (
          <Widget
            key={i}
            src={"astraplusplus.ndctools.near/widget/DAO.Proposals.Card.index"}
            props={{
              daoId: state.daoId ?? dao_id,
              proposalString: JSON.stringify(proposal),
              multiSelectMode: state.multiSelectMode,
              isCongressDaoID,
              isVotingBodyDao,
              daoConfig,
              dev: props.dev,
              showNavButton
            }}
          />
        );
      })}
  </div>
);
