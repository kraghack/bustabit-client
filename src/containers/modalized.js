import React  from 'react'


import { Modal } from 'react-bootstrap'


export default function Modalize({title, history, body}) {

	const BodyAlias = body; // this is to avoid the html <body> tag

	return (

		<Modal show={true} bsSize="large"
					 aria-labelledby="contained-modal-title-sm"
					 onHide={() => history.push('/')}>
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-sm">{ title }</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<BodyAlias
					history={history}
					pathname={history.location.pathname} // We send this to make it work with a pure component
				/>
			</Modal.Body>
		</Modal>

	)
}