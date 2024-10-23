const children = props.children ?? "Badge";
const variant = props.variant ?? ""; // primary, secondary, danger, success, info, outline, white, circle, round, black
const size = props.size ?? "md"; // sm, md, lg
const className = props.className ?? "";
const otherProps = props.otherProps ?? {};
const as = props.as ?? "span";

const Wrapper = styled[as]`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 4px 12px;
  font-size: 12px;
  line-height: 16px;
  white-space: nowrap;
  text-align: center;
  vertical-align: baseline;
  border-radius: 10px;
  font-weight: 600;
  line-height: 1;
  border: 1px solid transparent;

  &.circle {
    padding: 0;
    width: 1.7em;
    height: 1.7em;
  }

  &.sm {
    padding: 3px 8px;
    font-size: 10px;
    border-radius: 6px;
  }

  &.md {
    padding: 4px 14px;
    font-size: 12px;
    border-radius: 8px;
  }

  &.lg {
    padding: 6px 20px;
    font-size: 14px;
    border-radius: 10px;
  }

  &.primary {
    color: #11181c;
    background: #ffd50d;
    border-color: #ffd50d;

    &.outline {
      background: #ffd50d10;
      color: #dab70f;
      border-color: #ffd50d;
    }
  }

  &.secondary {
    color: #fff;
    background: linear-gradient(90deg, #9333ea 0%, #4f46e5 100%);
    border-color: transparent;

    &.outline {
      background: #9333ea10;
      color: #9333ea;
      border-color: #9333ea;
    }
  }

  &.danger {
    border-color: #e5484d;
    background: #e5484d;
    color: #fff;

    &.outline {
      background: #e5484d10;
      color: #e5484d;
      border-color: #e5484d;
    }
  }

  &.success {
    background: #82e299;
    color: #11181c;
    border-color: #82e299;

    &.outline {
      background: #82e29910;
      color: #82e299;
      border-color: #82e299;
    }
  }

  &.info {
    background: #4498e0;
    color: #fff;
    border-color: #4498e0;

    &.outline {
      background: #4498e010;
      color: #4498e0;
      border-color: #4498e0;
    }
  }

  &.white {
    background: #fff;
    color: #11181c;
    border-color: #fff;

    &.outline {
      background: transparent;
      color: #11181c;
      border-color: #eee;
    }
  }

  &.black {
    background: #11181c;
    color: #fff;
    border-color: #11181c;

    &.outline {
      background: transparent;
      color: #11181c;
      border-color: #11181c;
    }
  }

  &.disabled {
    background: #efefef;
    color: #11181c;
    border-color: #efefef;

    &.outline {
      background: transparent;
      color: #11181c;
      border-color: #efefef;
    }
  }

  &.round {
    border-radius: 100px;
  }
`;

return (
  <Wrapper className={`${variant} ${size} ${className}`} {...otherProps}>
    {children}
  </Wrapper>
);
