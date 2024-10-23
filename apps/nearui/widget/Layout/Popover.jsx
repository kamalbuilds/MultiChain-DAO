const triggerComponent = props.triggerComponent
const content = props.content

const Wrapper = styled.div`
.PopoverContent {
    border-radius:0.5rem;
    border-left: 0.3rem rgb(68, 152, 224) solid;
  padding: 10px;
  background-color: white;
  animation-duration: 400ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
z-index:9999;
}

.PopoverContent[data-state='open'][data-side='top'] {
  animation-name: slideDownAndFade;
}
.PopoverContent[data-state='open'][data-side='right'] {
  animation-name: slideLeftAndFade;
}
.PopoverContent[data-state='open'][data-side='bottom'] {
  animation-name: slideUpAndFade;
}
.PopoverContent[data-state='open'][data-side='left'] {
  animation-name: slideRightAndFade;
}

.PopoverContent:focus {
    outline: none;
}

.PopoverArrow {
  fill: white;
}

@keyframes slideUpAndFade {
  from {
    opacity: 0;
    transform: translateY(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideRightAndFade {
  from {
    opacity: 0;
    transform: translateX(-2px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideDownAndFade {
  from {
    opacity: 0;
    transform: translateY(-2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideLeftAndFade {
  from {
    opacity: 0;
    transform: translateX(2px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
`;

return (
  <Wrapper>
    <Popover.Root>
      <Popover.Trigger asChild>
        <div className="IconButton" aria-label="Update dimensions">
          {triggerComponent}
        </div>
      </Popover.Trigger>
      <Popover.Content className="PopoverContent" sideOffset={5}>
        {content}
     
        <Popover.Arrow className="PopoverArrow" />
      </Popover.Content>
    </Popover.Root>
  </Wrapper>
);
