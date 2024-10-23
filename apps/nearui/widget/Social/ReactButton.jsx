const reactions = props.reactions ?? [
  {
    id: "heart",
    emoji: "❤️",
    name: "Positive",
  },
  {
    id: "pray",
    emoji: "🙏",
    name: "Thank you",
  },
  {
    id: "100",
    emoji: "💯",
    name: "Definitely",
  },
  {
    id: "eyes",
    emoji: "👀",
    name: "Thinking",
  },
  {
    id: "fire",
    emoji: "🔥",
    name: "Awesome",
  },
  {
    id: "thumbs-up",
    emoji: "👍",
    name: "Like",
  },
  {
    id: "raised-hands",
    emoji: "🙌",
    name: "Celebrate",
  },
  {
    id: "clap",
    emoji: "👏",
    name: "Applause",
  },
  {
    id: "lightning",
    emoji: "⚡",
    name: "Lightning",
  },
  {
    id: "near",
    emoji: "⋈",
    name: "Near",
  },
];

const stats = props.stats;
const selected = props.selected;
const onChange = props.onChange ?? ((v) => console.log(v));

const selectedReaction = reactions.find((r) => r.id === selected);

const Button = styled.button`
  background: none;
  border: none;
  user-select: none;
  padding: 6px;
  font-size: 20px;
  display: flex;
  flex-direction: column;
  text-align: center;
  align-items: center;

  span {
    font-size: 13px;
  }

  i {
    transition: all 300ms cubic-bezier(0, 1.5, 1, 1.5);
    font-style: normal;
  }
  &:hover i {
    transform: scale(1.5);
  }
  &:active i {
    transform: scale(1.2);
  }
`;

return (
  <HoverCard.Root openDelay={200} closeDelay={600}>
    <HoverCard.Trigger asChild>
      <div className="d-inline-block">
        <Widget
          src="/*__@appAccount__*//widget/Input.Button"
          props={{
            children: selectedReaction ? (
              selectedReaction.emoji
            ) : (
              <i className="bi bi-emoji-smile" />
            ),
            variant: props.variant ?? "info rounded icon outline",
            onClick: selectedReaction && (() => onChange(null)),
            ...props.buttonProps,
          }}
        />
      </div>
    </HoverCard.Trigger>
    <HoverCard.Content
      alignOffset={16}
      side={"top"}
      style={{
        zIndex: 10000,
      }}
    >
      <div
        className="px-2 bg-white d-flex gap-1 max-vw-100 rounded-pill"
        style={{
          boxShadow:
            // by aftercss.com
            "inset 0px 0px 2px 1px rgb(196, 192, 202), inset 0px 0px 0px 3px white, rgb(205 205 230 / 60%) 0px 2px 2px, rgb(178, 174, 198) 0px 5px, rgb(77 77 122 / 90%) 0px 4px 2px 0px",
        }}
      >
        {(reactions || []).map((r, i) => {
          return (
            <OverlayTrigger
              key={r.name}
              placement={"top"}
              overlay={<Tooltip id={`tooltip-${r.name}`}>{r.name}</Tooltip>}
            >
              <Button onClick={() => onChange(r.id)}>
                <i>{r.emoji}</i>
                {<span>{parseInt(stats[r.id] || 0)}</span>}
              </Button>
              ;
            </OverlayTrigger>
          );
        })}
      </div>
    </HoverCard.Content>
  </HoverCard.Root>
);
