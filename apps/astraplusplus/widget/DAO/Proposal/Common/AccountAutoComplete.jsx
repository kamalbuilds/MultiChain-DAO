const accountId = props.accountId ?? "";
const onChange = props.onChange;
const placeholder = props.placeholder;
const [showAccountAutocomplete, setAutoComplete] = useState(false);
const [isValidAccount, setValidAccount] = useState(true);

useEffect(() => {
  const handler = setTimeout(() => {
    const valid = accountId.length === 64 || accountId.includes(".near");
    setValidAccount(valid);
    setAutoComplete(!valid);
  }, 100);

  return () => {
    clearTimeout(handler);
  };
}, [accountId]);

const AutoComplete = styled.div`
  margin-top: 1rem;
`;

const Wrapper = styled.div`
  .text-sm {
    font-size: 12px;
  }
`;

return (
  <Wrapper>
    <input
      type="text"
      value={accountId}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
    {accountId && !isValidAccount && (
      <div style={{ color: "red" }} className="text-sm">
        Please enter valid account ID
      </div>
    )}
    {showAccountAutocomplete && (
      <AutoComplete>
        <Widget
          src="devhub.near/widget/devhub.components.molecule.AccountAutocomplete"
          props={{
            term: accountId,
            onSelect: (id) => {
              onChange(id);
              setAutoComplete(false);
            },
            onClose: () => setAutoComplete(false)
          }}
        />
      </AutoComplete>
    )}
  </Wrapper>
);
