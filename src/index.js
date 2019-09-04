import React from "react"
import jsonp from "jsonp"
import PropTypes from 'prop-types';

class Mailchimp extends React.Component {
  state = {};

  handleSubmit(evt) {
    evt.preventDefault();
    const { fields, action } = this.props;
    const values = fields.map(field => {
      return `${field.name}=${encodeURIComponent(this.state[field.name])}`;
    }).join("&");
    const path = `${action}&${values}`;
    const url = path.replace('/post?', '/post-json?');
    const regex = /^([\w_\.\-\+])+\@([\w\-]+\.)+([\w]{2,10})+$/;
    const email = this.state['EMAIL'];
    (!regex.test(email)) ? this.setState({ status: "empty" }) : this.sendData(url);
  };

  sendData(url) {
    this.setState({ status: "sending" });
    jsonp(url, { param: "c" }, (err, data) => {
      if (data.msg.includes("already subscribed") || data.msg.includes("too many recent signup requests")) {
        this.setState({ status: 'duplicate' });
      } else if (err) {
        this.setState({ status: 'error' });
      } else if (data.result !== 'success') {
        this.setState({ status: 'error' });
      } else {
        this.setState({ status: 'success' });
      };
    });
  }

  render() {
    const { fields, className, title } = this.props;
    const messages = {
      ...Mailchimp.defaultProps.messages,
      ...this.props.messages
    }
    const { status } = this.state;
    const messageClass = status ? `msg-alert--${status}` : ''

    return (
      <div className={`${className} ${className}--${status}`}>
        <form className={`${className}__form`} onSubmit={this.handleSubmit.bind(this)} noValidate>
          <p className={`${className}__title`}>{title}</p>
          {fields.map(input =>
            <input
              className={`${className}__input`}
              {...input}
              key={input.name}
              onChange={({ target }) => this.setState({ [input.name]: target.value })}
              defaultValue={this.state[input.name]}
            />
          )}
          {status !== undefined &&
            <div className='msg-alert'>
              {status === "sending" && <p>{messages.sending}</p>}
              {status === "duplicate" && <p>{messages.duplicate}</p>}
              {status === "empty" && <p>{messages.empty}</p>}
              {status === "error" && <p>{messages.error}</p>}
            </div>
          }
          <button
            disabled={status === "sending" || status === "success" }
            type="submit"
            className={`${className}__btn`}>{messages.button}</button>
        </form>
        <div className='msg-alert msg-alert--success'>
          <p>{messages.success}</p>
        </div>
      </div>
    );
  }
}

Mailchimp.defaultProps = {
  messages: {
    sending: "Sending...",
    success: "Thank you for subscribing!",
    error: "An unexpected internal error has occurred.",
    empty: "You must write an e-mail.",
    duplicate: "Too many subscribe attempts for this email address",
    button: "Subscribe!"
  },
  buttonClassName: ""
};

Mailchimp.propTypes = {
  action: PropTypes.string,
  messages: PropTypes.object,
  fields: PropTypes.array,
  className: PropTypes.string,
  buttonClassName: PropTypes.string
};

export default Mailchimp;
