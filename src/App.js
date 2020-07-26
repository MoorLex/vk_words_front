import React, { Component } from 'react'
import { connect } from 'react-redux'
import bridge from '@vkontakte/vk-bridge'
import {
	View,
	ScreenSpinner
} from '@vkontakte/vkui'
import '@vkontakte/vkui/dist/vkui.css'
import { socket } from './server'
import { actions } from './store'
import Modals from './components/Modal'

import Main from './panels/Main'
import Game from './panels/Game'
import Loading from './panels/Loading'
import Error403 from './panels/Error_403'
import ErrorDisconnect from './panels/Error_Disconnect'

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
		const { storageUpdate } = this.props

		bridge.send("VKWebAppInit").then(() => {})
		bridge.subscribe(({ detail: { type, data }}) => {
			if (type === 'VKWebAppUpdateConfig') {
				const schemeAttribute = document.createAttribute('scheme');
				schemeAttribute.value = data.scheme ? data.scheme : 'client_light';
				document.body.attributes.setNamedItem(schemeAttribute);
			}
		})
		bridge.send('VKWebAppStorageGet', { keys: ['was_in_game'] }).then((data) => {
			const wasInGame = data.keys.find(({ key }) => key === 'was_in_game')
			storageUpdate({ wasInGame: wasInGame.value === 'true' })
		})
	}

	navigate = (activePanel) => {
		this.setState({ activePanel })
	}

	loading = (isLoading) => {
		this.setState({ popout: isLoading ? <ScreenSpinner /> : null })
	}

	async reloadGame () {
		const { storageUpdate } = this.props
		storageUpdate({ refreshing: true })
		socket.emit('core/start')
	}

	render () {
		const { activePanel, popout } = this.state
		const { storage } = this.props

		return (
			<View popout={popout}
						modal={<Modals activeModal={storage.activeModal}
													 onClose={() => this.navigate('main')}
													 onReload={() => this.reloadGame()} />}
						activePanel={activePanel}>
				<Loading id="loading"
								 navigate={this.navigate} />
				<Main id="main"
							navigate={this.navigate}
							loading={this.loading} />
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
	const { user, storage } = state
	return { user, storage }
}
export default connect(mapStateToProps, actions)(App)

