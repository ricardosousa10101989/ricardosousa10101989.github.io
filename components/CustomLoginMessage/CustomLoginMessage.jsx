import Image from 'components/Image';

import svgLogo from './assets/logo.svg';

// eslint-disable-next-line arrow-body-style
const CustomLogin = () => {
  return (
    <div className="custom-login-message">
      <Image
        className="custom-login-message__image"
        src={ svgLogo }
      />

      <h3 className="custom-login-message__title">
        Edite aqui o seu conteúdo!
      </h3>
    </div>
  );
};

export default CustomLogin;
