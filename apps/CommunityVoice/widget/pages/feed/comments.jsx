const { community, postAuthor, postBlockHeight, onClose, Config, Post } = props;

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: grid;
  place-items: center;
  overflow-y: auto;
  z-index: 1000;
  width: 100vw;
  height: 100vh;
`;
const Overlay = styled.span`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(6px);
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  width: 599px;
  max-width: 90vw;
  margin-top: 20px;
  margin-bottom: 20px;
  outline: none !important;
  max-height: 90vh;
  overflow: auto;

  & .ndc-card {
    box-shadow: none !important;
  }

  & hr {
    opacity: 0.1;
  }
`;

const index = [
  {
    action: Config.commentDataKey,
    key: {
      type: "social",
      path: `${postAuthor}/${Config.postDataKey}/main`,
      blockHeight: postBlockHeight,
    },
    options: {
      limit: 10,
      order: "desc",
    },
    cacheOptions: {
      ignoreCache: true,
    },
  },
];

const handleCreateComment = (body) => {
  Post.comment(
    {
      body: body,
      type: "md",
      community: community.id,
      tags: [],
    },
    postAuthor,
    postBlockHeight,
    () => console.log("commented successfully"),
    () => console.log("user canceled"),
    (e) => console.log("error", e),
  );
};

// -- Gating based on Community Rules
let canComment = true;

if (Array.isArray(community.rules.commenting.SBTs)) {
  // user should have the SBTs
  community.rules.commenting.SBTs.forEach((SBT) => {
    const allSBTs = Near.view(Config.SBTRegistry, "sbt_tokens_by_owner", {
      account: context.accountId,
    });

    if (allSBTs === null) return "";
    const hasSBT = (allSBTs || []).find((s) => s[0] === SBT)[1].length > 0;
    canComment = canComment && hasSBT;
  });
}
// -- End

return (
  <Container>
    <Overlay onClick={onClose} />
    <Content className="rounded-4 bg-white ndc-card">
      <div className="d-flex justify-content-between p-3 w-100">
        <h5>Comments</h5>
        <i
          className="bi bi-x-lg h4 text-danger"
          role="button"
          onClick={onClose}
        />
      </div>
      <Widget
        src="/*__@replace:nui__*//widget/Social.PostCompose"
        props={{
          buttonText: "Comment",
          initialBody: "",
          onPost: handleCreateComment,
          disabled: !canComment,
        }}
      />
      <hr />
      <Widget
        src="mob.near/widget/MergedIndexFeed"
        props={{
          index,
          renderItem: (p) => {
            return (
              <Widget
                src="/*__@appAccount__*//widget/pages.feed.comment"
                props={{
                  ...p,
                  Config,
                  Post,
                  community,
                }}
              />
            );
          },
        }}
      />
    </Content>
  </Container>
);
