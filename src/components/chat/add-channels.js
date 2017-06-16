import React, { Component } from 'react';
import  { Tooltip, OverlayTrigger } from 'react-bootstrap'
import chatFlags from '../../util/chat-flags'
import { objectEntries } from '../../util/belt'
import chat from '../../core/chat'
import userInfo from '../../core/user-info'
import refresher from '../../refresher'
import { Link } from 'react-router-dom'


class ChatChannels extends Component {

	canAddFriend() {
		if (!userInfo.uname) return '';

		return <Link className="btn btn-xs btn-success" to="/add-friend">
        <i className="fa fa-user"></i> Add
      </Link>

	}

  render() {

    return (
      <div className="chat-rooms-container col-sm-10">

          { objectEntries(chatFlags).map(([name, flag]) => {
            let tooltip = (
              <Tooltip id="tooltip">{name}</Tooltip>
            );

            return (
              <OverlayTrigger placement="bottom" overlay={tooltip} key={name}>
                  <img
                    key={name}
                    src={flag}
                    style={{ width: '32px' }}
										onClick={ () => chat.openChannel(name) }
                    alt={name}
                  />
              </OverlayTrigger>
            );
          })}
				{this.canAddFriend()}

      </div>
    )
  }


}

export default refresher(ChatChannels,
	[userInfo, 'UNAME_CHANGED']
);

