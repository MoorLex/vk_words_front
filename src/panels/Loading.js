import React, { Component } from 'react'
import { connect } from 'react-redux'
import bridge from '@vkontakte/vk-bridge'
import {
	Alert,
	Panel,
	Placeholder,
	Spinner
} from '@vkontakte/vkui'
import { socket } from '../server'
import { actions } from '../store'
import { game, setGame } from '../game'
import IconFavoriteOutline from '@vkontakte/icons/dist/56/favorite_outline'
import IconUsersOutline from '@vkontakte/icons/dist/56/users_outline'

export class Loading extends Component {

	async reloadGame () {
		const { storageUpdate } = this.props
		storageUpdate({ refreshing: true, opponent: undefined })
		const { words, words_length } = game
		socket.emit('core/start', { words: words.length, wordsLength: words_length })
	}

	componentDidMount () {
		const { storageUpdate, userUpdate, navigate, closePopup, closeModal, openPopup } = this.props

		closePopup()
		closeModal()

		bridge.send("VKWebAppGetUserInfo").then((data) => {
			userUpdate(data)
			socket.emit('core/init', { ...data, params: window.location.search.slice(1).split('#')[0] })
		})

		if (process.env.REACT_APP_LOCAL_USER_DATA) {
			const data = JSON.parse(process.env.REACT_APP_LOCAL_USER_DATA)
			userUpdate(data)
			socket.emit('core/init', { ...data, params: window.location.search.slice(1) })
		}

		// document.body.setAttribute('scheme', 'space_gray');

		socket.on('core/ready', async (data) => {
			userUpdate({
				...data,
				connected: true
			})
			storageUpdate({ connected: true })
			setTimeout(() => {
				if (window.location.href.split('#')[1]) {
					socket.emit('core/join', window.location.href.split('#')[1])
				} else {
					navigate(data.new ? 'launch' : 'main')
				}
			}, 500)
		})

		socket.on('game/start', (data) => {
			setGame(data.game)
			closePopup()
			navigate('game')
			storageUpdate({
				extraWords: [],
				refreshing: false,
				opponent: data.opponent
			})
			if (window.location.href.split('#')[0]) {
				window.history.pushState("", document.title, window.location.href.split('#')[0]);
			}
		})
		socket.on('game/finish', (data) => {
			storageUpdate({ hasWords: false })
			openPopup(
				<Alert onClose={() => {
					closePopup()
					navigate('main')
				}}
							 actions={[{
								 title: 'Сыграть еще',
								 action: () => this.reloadGame()
							 }]} >
					<div style={{ display: 'flex', justifyContent: 'center' }}>
						{data.win ? (<IconFavoriteOutline />) : (<IconUsersOutline />)}
					</div>
					<h2>{data.win ? 'Вы нашли все слова!' : 'Ваш противник выйграл!'}</h2>
					<p>Хотите повторить игру?</p>
				</Alert>
			)
		})

		socket.on('core/error', (data) => {
			console.warn(data)
			closePopup()
			closeModal()
			if (window.location.href.split('#')[0]) {
				window.history.pushState("", document.title, window.location.href.split('#')[0]);
			}
			storageUpdate({ activeModal: null, opponent: undefined })
			if (data.code === 403) {
				setTimeout(() => navigate('error_403'), 800)
			}
			if (data.code === 404) {
				navigate('main')
			}
			if (data.code === 405) {
				navigate('main')
			}
			if (data.code === 422) {
				navigate('main')
			}
		})

		socket.on('error', () => this.onError())
		socket.on('disconnect', () => this.onError())
		socket.on('connect_error', () => this.onError())
		socket.on('reconnect_error', () => this.onError())
		socket.on('reconnect_failed', () => this.onError())
	}

	onError () {
		const { navigate, closePopup, closeModal } = this.props

		navigate('error_disconnect')
		closePopup()
		closeModal()
	}

	render () {
		return (
			<Panel id="loading">
				<Placeholder stretched>
					<Spinner size="large"/>
				</Placeholder>
			</Panel>
		)
	}
}

const mapStateToProps = (state) => {
	const { storage } = state
	return { storage }
}
export default connect(mapStateToProps, actions)(Loading)
