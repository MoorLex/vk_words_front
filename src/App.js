import React, { Component } from 'react'
import { connect } from 'react-redux'
import bridge from '@vkontakte/vk-bridge'
import { View } from '@vkontakte/vkui'
import '@vkontakte/vkui/dist/vkui.css'
import { actions, onBlur } from './store'
import Modals from './components/Modal'

import Main from './panels/Main'
import Game from './panels/Game'
import Loading from './panels/Loading'
import Error403 from './panels/Error_403'
import Launch from './panels/Launch'
import ErrorDisconnect from './panels/Error_Disconnect'


const routes = [
	'game',
	'main',
	'loading',
	'launch',
	'error_403',
	'error_disconnect'
]

export class App extends Component{
	constructor(props) {
		super(props)
		this.state = {
			activePanel: 'loading',
			refreshing: false,
			popout: null
		}
	}

	componentDidMount() {
		const { storageUpdate, closeModal, closePopup } = this.props
		bridge.send("VKWebAppInit").then(() => {})
		bridge.subscribe(({ detail: { type, data }}) => {
			if (type === 'VKWebAppUpdateConfig') {
				storageUpdate({ theme: data.scheme === 'space_gray' ? 'dark' : 'light' })
				const schemeAttribute = document.createAttribute('scheme');
				schemeAttribute.value = data.scheme ? data.scheme : 'client_light';
				document.body.attributes.setNamedItem(schemeAttribute);
				bridge.send("VKWebAppSetViewSettings", {
					status_bar_style: data.scheme === 'space_gray' ? 'light' : 'dark',
					action_bar_color: data.scheme === 'space_gray' ? '#19191a' : '#ffffff'
				});
			}
			if (type === 'VKWebAppViewHide') { onBlur() }
			if (type === 'VKWebAppViewRestore') { onBlur() }
		})

		window.addEventListener("hashchange", ({ oldURL }) => {
			const { modals } = this.props
			const hash = window.location.hash.slice(1)
			if (routes.includes(hash) || hash === '') {
				this.setState({
					activePanel: hash || 'main'
				})
				closePopup()
			}

			if (oldURL.split('#')[1] === 'modal' && modals.timestamp + 500 <= Date.now()) {
				closeModal()
			} else if (oldURL.split('#')[1] === 'modal') {
				window.location.hash = 'modal'
			}

		}, false);

		// document.body.setAttribute('scheme', 'space_gray');
	}

	navigate = (activePanel, force = false) => {
		if (!force) {
			window.location.hash = activePanel;
		} else {
			this.setState({ activePanel })
		}
	}

	render () {
		const { activePanel } = this.state
		const { popup } = this.props

		return (
			<View popout={popup}
						modal={<Modals onClose={() => this.navigate('main')} />}
						activePanel={activePanel}>
				<Loading id="loading"
								 navigate={this.navigate} />
				<Launch id="launch"
								navigate={this.navigate} />
				<Main id="main"
							navigate={this.navigate} />
				<Game id="game"
							navigate={this.navigate} />
				<Error403 id="error_403"
									navigate={this.navigate} />
				<ErrorDisconnect id="error_disconnect"
												 navigate={this.navigate} />
			</View>
		)
	}
}

const mapStateToProps = (state) => {
	const { user, storage, popup, modals } = state
	return { user, storage, popup, modals }
}
export default connect(mapStateToProps, actions)(App)

