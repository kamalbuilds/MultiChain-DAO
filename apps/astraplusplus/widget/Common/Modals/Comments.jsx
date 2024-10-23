const commentsCount = props.commentsCount;
const item = props.item;

const Wrapper = styled.div`
  padding: 24px;
  border-radius: 14px;

  & > div {
    margin-left: 0 !important;
  }
  textarea {
    font-size: 0.9rem !important;
    margin-bottom: 24px !important;
  }

  p {
    margin-bottom: 16px;
  }
`;

const Hr = styled.hr`
  border: none;
  border-top: 1px solid #d7dbdf;
  margin: 16px 0;
`;

return (
  <Wrapper className="mb-2 w-100">
    <Widget
      src={`mob.near/widget/MainPage.N.Comment.Compose`}
      props={{
        item,
        onComment: () => State.update({ showReply: false })
      }}
    />
    <Widget
      src="mob.near/widget/MainPage.N.Comment.Feed"
      props={{
        item,
        subscribe: true
      }}
    />
    {commentsCount === 0 && (
      <span className="text-muted text-center mt-3">
        No comments yet. Be the first to comment!
      </span>
    )}
  </Wrapper>
);
