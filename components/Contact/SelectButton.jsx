import classnames from 'classnames';

import useContactForm from 'hooks/useContactForm';

const SelectButton = ({
  children, className, name, onClick, value,
}) => {
  const { contactForm, set } = useContactForm();

  return (
    <button
      className={ classnames('contact__select-button', className, {
        'contact__select-button--active': contactForm[name] === value,
      }) }
      onClick={ () => {
        set({ name, value });

        if (onClick) {
          onClick(value);
        }
      } }
      type="button"
    >
      <span className="contact__select-button__inner">
        { children }
      </span>
    </button>
  );
};

export default SelectButton;
