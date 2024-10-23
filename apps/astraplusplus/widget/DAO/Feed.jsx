const daoId = props.daoId;
const [showComposeModal, setShowComposeModal] = useState(false);
const [postContent, setPostContent] = useState(null);

const policy = Near.view(daoId, "get_policy");

function extractMentions(text) {
  const mentionRegex =
    /@((?:(?:[a-z\d]+[-_])*[a-z\d]+\.)*(?:[a-z\d]+[-_])*[a-z\d]+)/gi;
  mentionRegex.lastIndex = 0;
  const accountIds = new Set();
  for (const match of text.matchAll(mentionRegex)) {
    if (
      !/[\w`]/.test(match.input.charAt(match.index - 1)) &&
      !/[/\w`]/.test(match.input.charAt(match.index + match[0].length)) &&
      match[1].length >= 2 &&
      match[1].length <= 64
    ) {
      accountIds.add(match[1].toLowerCase());
    }
  }
  return [...accountIds];
}

function extractTagNotifications(text, item) {
  return extractMentions(text || "")
    .filter((accountId) => accountId !== daoId)
    .map((accountId) => ({
      key: accountId,
      value: {
        type: "mention",
        item
      }
    }));
}

function composeData(content) {
  const data = {
    post: {
      main: JSON.stringify(content)
    },
    index: {
      post: JSON.stringify({
        key: "main",
        value: {
          type: "md"
        }
      })
    }
  };

  const notifications = extractTagNotifications(content.text, {
    type: "social",
    path: `${daoId}/post/main`
  });

  if (notifications.length) {
    data.index.notify = JSON.stringify(
      notifications.length > 1 ? notifications : notifications[0]
    );
  }
  return data;
}

function addProposal(content) {
  const base64 = Buffer.from(
    JSON.stringify({
      data: {
        [daoId]: composeData(content)
      },
      options: { refund_unused_deposit: true }
    }),
    "utf-8"
  ).toString("base64");
  Near.call({
    contractName: daoId,
    methodName: "add_proposal",
    args: {
      proposal: {
        description: `Social Feed post created by ${context.accountId}`,
        kind: {
          FunctionCall: {
            receiver_id: "social.near",
            actions: [
              {
                method_name: "set",
                args: base64,
                deposit: "100000000000000000000000",
                gas: "200000000000000"
              }
            ]
          }
        }
      }
    },
    deposit: policy?.proposal_bond || 100000000000000000000000,
    gas: 200000000000000
  });
}

const Wrapper = styled.div`
  .border-vertical {
    border-top: 1px solid rgb(236, 238, 240);
    border-bottom: 1px solid rgb(236, 238, 240);
    margin-bottom: 2rem;
  }
`;

return (
  <Wrapper>
    <div className="d-flex flex-column gap-2">
      <h3>DAO Feed</h3>
      <div className="border-vertical">
        <Widget
          src="/*__@appAccount__*//widget/Common.Components.Compose"
          props={{ accountId: daoId, onPostClick: addProposal }}
        />
      </div>
    </div>
    <Widget
      src="/*__@appAccount__*//widget/Common.Components.Feed"
      props={{
        accounts: [daoId]
      }}
    />
  </Wrapper>
);
