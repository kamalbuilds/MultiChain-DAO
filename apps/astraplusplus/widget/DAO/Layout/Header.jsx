const daoId = props.daoId;
const profile = daoId ? Social.get(`${daoId}/profile/**`, "final") : {};
const currentLink = `#//*__@appAccount__*//widget/home?page=dao&daoId=${daoId}`;
const accountId = context.accountId;

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
State.init({
  joinRole: "council"
});

// Follower Count:
const following = Social.keys(`${daoId}/graph/follow/*`, "final", {
  return_type: "BlockHeight",
  values_only: true
});
const followers = Social.keys(`*/graph/follow/${daoId}`, "final", {
  return_type: "BlockHeight",
  values_only: true
});
const followingCount = following
  ? Object.keys(following[daoId].graph.follow || {}).length
  : null;

const followersCount = followers ? Object.keys(followers || {}).length : null;

const policy = useCache(
  () =>
    Near.asyncView(daoId, "get_policy").then((policy) => {
      return {
        policy
      };
    }),
  daoId + "-policy",
  { subscribe: false }
);

const config = useCache(
  () =>
    Near.asyncView(daoId, "get_config").then((config) => ({
      ...config,
      metadata: config.metadata
        ? JSON.parse(Buffer.from(config.metadata, "base64").toString())
        : null
    })),
  daoId + "-config",
  { subscribe: false }
);

if (policy === null || config === null) return "";

profile = {
  ...profile,
  name: profile?.name || config?.metadata?.displayName || daoId,
  description: profile?.description || config?.purpose,
  backgroundImage: profile?.backgroundImage || `${config?.metadata?.flagCover}`,
  image: profile?.image || `${config?.metadata?.flagLogo}`
};

let roles = [];

if (policy?.policy?.roles) {
  roles = policy?.policy?.roles
    ?.filter((r) => r.kind && r.kind !== "Everyone")
    ?.map((r) => r.name);
}

const onAddUserProposal = (memberId, roleId) => {
  Near.call([
    {
      contractName: daoId,
      methodName: "add_proposal",
      args: {
        proposal: {
          description: "Potential member",
          kind: {
            AddMemberToRole: {
              member_id: memberId,
              role: roleId ?? "council"
            }
          }
        }
      },
      gas: 219000000000000,
      deposit: policy?.policy?.proposal_bond || 100000000000000000000000
    }
  ]);
};

const BG = styled.div`
  --bs-aspect-ratio: 16%;
  background-color: #eee;
  background-size: cover;
  background-position: center;
  min-height: 120px;
`;

const Avatar = styled.div`
  background-color: #eee;
  background-size: cover;
  background-position: center;
  min-height: 140px;
  min-width: 140px;
  max-height: 140px;
  max-width: 140px;
`;

const Root = styled.div`
  font-size: 14px;

  .short-description {
    max-height: 100px;
    overflow-y: auto;

    p {
      color: #999;
    }
  }

  .profile__metadata {
    display: flex;
    justify-content: space-between;
  }

  @media (max-width: 768px) {
    .profile__metadata {
      display: flex;
      flex-direction: column;
    }
    .profile__buttons {
      grid-column: 1 / span 2;
    }
  }

  @media (max-width: 576px) {
    .profile__metadata {
      grid-template-columns: 1fr;
    }
    .profile__buttons {
      grid-column: 1 / span 1;
    }
  }
`;

const DropdownMenu = styled("Popover.Content")`
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  padding: 0.5rem;
  outline: none;

  ul {
    list-style: none;
    display: block;
    margin: 0;
    padding: 0;
  }

  li {
    display: block;
  }

  a {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    padding: 0.5rem;
    font: var(--text-base);
    color: var(--sand12);
    outline: none;
    text-decoration: none;

    &:hover,
    &:focus {
      text-decoration: underline;
    }
  }

  i {
    color: var(--violet8);
  }
`;

const clickbaitPrompt = `
Join the ${profile.name || daoId} DAO on the BOS
\n#NEAR #BOS #DAO\n
https://near.org/${currentLink}
`;

const twitterUrl = new URL("https://twitter.com/intent/tweet");
twitterUrl.searchParams.set("text", clickbaitPrompt);

const mailtoUrl = new URL("mailto:");
mailtoUrl.searchParams.set(
  "subject",
  `Join the ${profile.name || daoId} DAO on the BOS`
);
mailtoUrl.searchParams.set(
  "body",
  `Take a look at this DAO. \n https://near.org/${currentLink}`
);

const daoImageMapping = {
  "voting-body-v1.ndc-gwg.near": {
    name: "Voting Body",
    bg: "https://ipfs.near.social/ipfs/bafkreie4lmqqbejuk2ajyh27oisufsbtr5okozq6qrvjqg4crorj7v5q2i",
    logo: "https://ipfs.near.social/ipfs/bafkreiauj65shmnvbhtqldx6apkb6rj6kcunp5ldjwe5urd4pi2mc2vzhi"
  },
  "congress-hom-v1.ndc-gwg.near": {
    name: "House of Merit",
    bg: "https://ipfs.near.social/ipfs/bafkreigsbznuktrxqad3zfci6cwk5xhmdbtr6dndjuy22fsoewmxgktaky",
    logo: "https://ipfs.near.social/ipfs/bafkreidbveybpm7lwd27hbi3cwwlho2khilkpqflmomq3sq75jtqtt4mfq"
  },
  "congress-coa-v1.ndc-gwg.near": {
    name: "Council of Advisors",
    bg: "https://ipfs.near.social/ipfs/bafkreigy6rhzup4l5cokxousukfptmwhlpffsgj3jqakal43rkagspvobq",
    logo: "https://ipfs.near.social/ipfs/bafkreibhzo5hsx6v5epdrizc5v66fygas6b44xep7c3s4kvcxdu4ieovn4"
  },
  "congress-tc-v1.ndc-gwg.near": {
    name: "Transparency Commission",
    bg: "https://ipfs.near.social/ipfs/bafkreif2gbfyv5kt4t3q7xe2uc6aywed4k4h5ns6a6avktqlsdjzw73wu4",
    logo: "https://ipfs.near.social/ipfs/bafkreia7zwjqzd4htab7be6nx3ys26q5pd3l7hww3jw6jlnbszmk74w6si"
  }
};

return (
  <Root>
    <BG
      className="ratio rounded-4 mb-3"
      style={{
        backgroundImage: profile?.backgroundImage.ipfs_cid
          ? `url(https://ipfs.near.social/ipfs/${profile?.backgroundImage.ipfs_cid})`
          : `url(${daoImageMapping[daoId]?.bg || profile?.backgroundImage})`
      }}
      aria-label="DAO Cover Image"
      role="img"
    ></BG>

    <div className="profile__metadata gap-3 w-100">
      <div className="d-flex gap-3">
        <Avatar
          className="avatar rounded-4 border border-2 border-white ratio ratio-1x1 position-relative z-1"
          style={{
            backgroundImage: profile?.image.ipfs_cid
              ? `url(https://ipfs.near.social/ipfs/${profile?.image.ipfs_cid})`
              : `url(${daoImageMapping[daoId]?.logo || profile?.image})`
          }}
        ></Avatar>
        <div>
          <h2 className="fw-bolder mb-1">
            {daoImageMapping[daoId]?.name || profile.name || daoId}
          </h2>
          <p className="mb-1 text-muted">@{daoId}</p>
          <div className="short-description mb-2">
            <Markdown text={profile.description} />
          </div>
          <div className="d-flex gap-3 flex-wrap mb-3">
            <a href={`/${currentLink}&tab=following`}>
              <b>{followingCount === null ? "--" : followingCount}</b>{" "}
              <span className="text-muted">Following</span>
            </a>
            <span>|</span>
            <a href={`/${currentLink}&tab=followers`}>
              <b>{followersCount === null ? "--" : followersCount}</b>{" "}
              <span className="text-muted">Followers</span>
            </a>
          </div>
          {profile.linktree && (
            <ul className="d-flex list-unstyled gap-3 flex-wrap">
              {profile.linktree.website && (
                <a href={`https://${profile.linktree.website}`} target="_blank">
                  <i className="bi bi-globe"></i> {profile.linktree.website}
                </a>
              )}

              {profile.linktree.github && (
                <a
                  href={`https://github.com/${profile.linktree.github}`}
                  target="_blank"
                >
                  <i className="bi bi-github"></i> {profile.linktree.github}
                </a>
              )}

              {profile.linktree.twitter && (
                <a
                  href={`https://twitter.com/${profile.linktree.twitter}`}
                  target="_blank"
                >
                  <i className="bi bi-twitter"></i> {profile.linktree.twitter}
                </a>
              )}

              {profile.linktree.telegram && (
                <a
                  href={`https://t.me/${profile.linktree.telegram}`}
                  target="_blank"
                >
                  <i className="bi bi-telegram"></i> {profile.linktree.telegram}
                </a>
              )}
            </ul>
          )}
        </div>
      </div>

      <div className="d-flex align-items-start gap-2 mb-4">
        <Widget
          src="/*__@replace:nui__*//widget/Social.FollowButton"
          props={{
            accountId: daoId,
            variant: "info",
            className: "w-100"
          }}
        />
        {isVotingBodyDao && (
          <Widget
            src="nearui.near/widget/Input.Button"
            props={{
              children: (
                <a
                  href={`https://i-am-human.app/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "rgb(68, 152, 224)" }}
                >
                  Join by proving your humanity
                </a>
              ),
              variant: "info outline"
            }}
          />
        )}
        {!isCongressDaoID && !isVotingBodyDao && (
          <Widget
            src="/*__@appAccount__*//widget/Layout.Modal"
            props={{
              toggleContainerProps: {
                className: "w-100"
              },
              toggle: (
                <Widget
                  src="/*__@replace:nui__*//widget/Input.Button"
                  props={{
                    variant: "info outline",
                    className: "w-100",
                    children: "Ask to Join"
                  }}
                />
              ),
              content: (
                <div className="ndc-card p-4">
                  <Widget
                    src="nearui.near/widget/Input.Select"
                    props={{
                      label: "Role you want to join as",
                      options: roles.map((r) => {
                        return {
                          title: r,
                          value: r
                        };
                      }),
                      onChange: (v) => State.update({ joinRole: v }),
                      value: state.joinRole
                    }}
                  />
                  <Widget
                    src="nearui.near/widget/Input.Button"
                    props={{
                      children: "Propose to Join",
                      variant: ["info"],
                      className: "w-100 mt-3",
                      onClick: () =>
                        onAddUserProposal(accountId, state.joinRole)
                    }}
                  />
                </div>
              )
            }}
          />
        )}
        <Popover.Root>
          <Popover.Trigger asChild>
            <div className="w-100">
              <Widget
                src="/*__@replace:nui__*//widget/Input.Button"
                props={{
                  variant: "info outline",
                  children: <i className="bi bi-share" />
                }}
              />
            </div>
          </Popover.Trigger>

          <DropdownMenu sideOffset={5}>
            <ul>
              <li>
                <Popover.Close asChild>
                  <a href={mailtoUrl.toString()} target="_blank">
                    <i
                      className="bi bi-envelope"
                      style={{ color: "#4498E0" }}
                    />{" "}
                    Share by email
                  </a>
                </Popover.Close>
              </li>
              <li>
                <Popover.Close asChild>
                  <a href={twitterUrl.toString()} target="_blank">
                    <i className="bi bi-twitter" style={{ color: "#4498E0" }} />
                    Share on Twitter
                  </a>
                </Popover.Close>
              </li>
            </ul>

            <Popover.Arrow style={{ fill: "#fff" }} />
          </DropdownMenu>
        </Popover.Root>
      </div>
    </div>
  </Root>
);
