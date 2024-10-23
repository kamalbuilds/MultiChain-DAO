const tabs = props.tabs;
const selected = props.tab;
const update = props.update;
const allowHref = props.allowHref ?? true;

const Container = styled.div`
  display: flex;
  height: 48px;
  border-bottom: 1px solid #eceef0;
  margin-bottom: 28px;
  overflow-x: auto;
  scroll-behavior: smooth;
  max-width: 100%;
`;

const Item = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-weight: 600;
  font-size: 14px;
  padding: 0 14px;
  position: relative;
  color: ${(p) => (p.selected ? "#11181C" : "#687076")};
  background: none;
  border: none;
  outline: none;
  text-align: center;
  text-decoration: none !important;
  cursor: pointer;

  &:hover {
    color: #11181c;
  }

  &::after {
    content: "";
    display: ${(p) => (p.selected ? "block" : "none")};
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: #59e692;
  }
`;

return (
  <Container>
    {Object.keys(tabs).map((id) =>
      allowHref ? (
        <Item
          selected={selected === id}
          href={tabs[id].href}
          key={id}
          onClick={() => update({ tab: id })}
        >
          {tabs[id].name}
        </Item>
      ) : (
        <Item
          selected={selected === id}
          key={id}
          onClick={() => update({ tab: id })}
        >
          {tabs[id].name}
        </Item>
      )
    )}
  </Container>
);
