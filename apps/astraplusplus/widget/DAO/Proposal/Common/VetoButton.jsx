const {
    daoId,
    proposal,
    isCongressDaoID,
    isVotingBodyDao,
    daoConfig,
    isHuman,
    currentuserCongressHouse,
    CoADaoId,
    HoMDaoId,
    registry
} = props;
const accountId = context.accountId;

State.init({
    isProposalModalOpen: false
});

const proposalPastCooldown =
    proposal?.submission_time +
        (daoConfig?.vote_duration ?? daoConfig?.voting_duration) +
        (daoConfig?.cooldown ?? 0) <
    Date().now;

const disableVetoButton =
    currentuserCongressHouse !== CoADaoId
        ? true
        : proposalPastCooldown
        ? true
        : proposal.status === "Vetoed" || proposal.status === "Rejected";

const VetoButton = styled.button`
    padding: 10px;
    padding-inline: 40px;
    background-color: red;
    color: white;
    border-radius: 10px;
    line-height: 23px;
`;

const description = `### Veto HoM Proposal ID ${proposal.id} \n
Vote "Approve" = "Veto"; Vote "Reject" = "Do not support veto" \n\n${proposal.description}`;

return (
    <div className="w-100">
        <Widget
            src="/*__@appAccount__*//widget/Common.Layout.CardModal"
            props={{
                title: "Veto Proposal",
                onToggle: () =>
                    State.update({
                        isProposalModalOpen: !state.isProposalModalOpen
                    }),
                isOpen: state.isProposalModalOpen,
                toggle: (
                    <VetoButton
                        className="custom-tooltip veto-btn"
                        disabled={disableVetoButton}
                    >
                        <span
                            style={{ left: "-20%", width: "200px" }}
                            class="tooltiptext"
                        >
                            Initiation of a veto is limited to CoA members and
                            must occur before the proposal cooldown period
                            expires.
                        </span>
                        Veto
                    </VetoButton>
                ),
                content: (
                    <div
                        className="d-flex flex-column align-items-stretch"
                        style={{
                            width: "800px",
                            maxWidth: "100vw"
                        }}
                    >
                        <Widget
                            src="/*__@replace:nui__*//widget/Element.Badge"
                            props={{
                                size: "lg",
                                variant: "info outline mb-3",
                                children:
                                    "Please make sure there is no existing Veto proposal with same proposal ID created to avoid spam."
                            }}
                        />

                        {currentuserCongressHouse === CoADaoId ? (
                            <Widget
                                src="/*__@appAccount__*//widget/DAO.Proposal.Create.Veto"
                                props={{
                                    daoId: CoADaoId,
                                    dev: props.dev,
                                    registry,
                                    isHookCall: true,
                                    proposalID: proposal.id,
                                    description: description
                                }}
                            />
                        ) : (
                            <Widget
                                src="/*__@appAccount__*//widget/DAO.Proposal.Create.Veto"
                                props={{
                                    daoId: CoADaoId,
                                    dev: props.dev,
                                    registry,
                                    isHookCall: false,
                                    house: HoMDaoId,
                                    proposalID: proposal.id,
                                    description: description
                                }}
                            />
                        )}
                    </div>
                )
            }}
        />
    </div>
);
