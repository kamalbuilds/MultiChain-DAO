const title = props.title;
const content = props.content ?? <div>Modal Content</div>;
const toggle = props.toggle ?? <button role="none">Open Modal</button>;
const toggleContainerProps = props.toggleContainerProps ?? {};
const isOpen = props.isOpen;
const onToggle = props.onToggle;

const Modal = styled.div`
  display: ${({ hidden }) => (hidden ? "none" : "flex")};
  position: fixed;
  inset: 0;
  justify-content: center;
  align-items: center;
  opacity: 1;
  z-index: 999;
`;

const ModalBackdrop = styled.div`
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0.4;
`;

const ModalDialog = styled.div`
  padding: 2em;
  z-index: 999;
  overflow-y: auto;
  max-height: 85%;
  margin-top: 5%;
  @media (width < 720px) {
    width: 100%;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 4px;
`;

const ModalFooter = styled.div`
  padding-top: 4px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: items-center;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  padding: 0.5em;
  border-radius: 6px;
  border: 0;
  color: #344054;

  &:hover {
    background-color: #d3d3d3;
  }
`;

const ConfirmButton = styled.button`
  padding: 0.7em;
  border-radius: 6px;
  border: 0;
  box-shadow: 0px 1px 2px rgba(16, 24, 40, 0.05);
  background-color: #12b76a;
  color: white;

  &:hover {
    background-color: #0e9f5d;
  }
`;

const ModalContent = styled.div`
  flex: 1;
  margin-top: 4px;
  margin-bottom: 4px;
  overflow-y: auto;
  max-height: 50%;
`;

const NoButton = styled.button`
  background: transparent;
  border: none;
  padding: 0;
  margin: 0;
  box-shadow: none;
`;

return (
  <>
    <NoButton {...toggleContainerProps} onClick={onToggle}>
      {toggle}
    </NoButton>
    <Modal hidden={!isOpen}>
      <ModalBackdrop />
      <ModalDialog className="ndc-card">
        <ModalHeader>
          <h3 className="mb-0">{title}</h3>
          <CloseButton onClick={onToggle}>
            <i class="bi bi-x-lg"></i>
          </CloseButton>
        </ModalHeader>
        <ModalContent>{content}</ModalContent>
      </ModalDialog>
    </Modal>
  </>
);
