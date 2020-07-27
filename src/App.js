import React, { Component } from 'react'
import { connect } from 'react-redux'
import bridge from '@vkontakte/vk-bridge'
import {
	View,
	Alert,
	ScreenSpinner
} from '@vkontakte/vkui'
import '@vkontakte/vkui/dist/vkui.css'
import { socket } from './server'
import { actions } from './store'
import { game } from './game'
import Modals from './components/Modal'

import Main from './panels/Main'
import Game from './panels/Game'
import Loading from './panels/Loading'
import Error403 from './panels/Error_403'
import Launch from './panels/Launch'
import ErrorDisconnect from './panels/Error_Disconnect'
import IconFavoriteOutline from '@vkontakte/icons/dist/56/favorite_outline'

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
				storageUpdate({ theme: data.scheme === 'space_gray' ? 'dark' : 'light' })
				const schemeAttribute = document.createAttribute('scheme');
				schemeAttribute.value = data.scheme ? data.scheme : 'client_light';
				document.body.attributes.setNamedItem(schemeAttribute);
			}
		})

		// document.body.setAttribute('scheme', 'space_gray');
	}

	navigate = (activePanel) => {
		this.setState({ activePanel })
	}

	loading = (isLoading) => {
		this.setState({ popout: isLoading ? <ScreenSpinner /> : null })
	}

	finish = (isFinish) => {
		this.setState({ popout: isFinish ? (
				<Alert onClose={() => {
									this.finish(false)
									this.navigate('main')
								}}
							 actions={[{
								 title: 'Сыграть еще',
								 action: () => this.reloadGame()
							 }]} >
					<div style={{ display: 'flex', justifyContent: 'center' }}>
						<IconFavoriteOutline />
					</div>
					<h2>Вы нашли все слова!</h2>
					<p>Хотите повторить игру?</p>
				</Alert>
			) : null })
	}

	async reloadGame () {
		const { storageUpdate } = this.props
		storageUpdate({ refreshing: true, activeModal: null, stop: false, opponent: undefined })
		const { words, words_length } = game
		socket.emit('core/start', { words: words.length, wordsLength: words_length })
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
								 navigate={this.navigate}
								 finish={this.finish}
								 loading={this.loading} />
				<Launch id="launch"
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

