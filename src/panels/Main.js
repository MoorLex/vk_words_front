import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
	Panel,
	PanelHeader,
	Gallery,
	Banner,
	Button,
	Group,
	Header,
	SimpleCell,
	PromoBanner,
	Avatar,
	Div,
	Title,
	Caption,
	Footer,
	ScreenSpinner
} from '@vkontakte/vkui'
import { api } from '../api'
import bridge from '@vkontakte/vk-bridge'
import IconFire from '@vkontakte/icons/dist/12/fire'
import { actions } from '../store'
import { socket } from '../server'
import CountUp from 'react-countup'
import FlipMove from 'react-flip-move'

export class Main extends Component {
	addScript

	constructor (props) {
		super(props)
		this.state = {
			words: props.user.words,
			types: [
				{
					id: 1,
					name: 'Для начала',
					text: 'найдите всего 5 слов',
					color: '#665195',
					image: 'banner-1.png',
					words: 5,
					wordsLength: 4
				},
				{
					id: 2,
					name: 'Довольно просто',
					text: 'отгадать 7 слов',
					color: '#65c063',
					image: 'banner-2.png',
					words: 7,
					wordsLength: 5
				},
				{
					id: 3,
					name: 'Ух, как сложно',
					text: 'найти 13 слов',
					color: '#f27c59',
					image: 'banner-3.png',
					words: 13,
					wordsLength: 6
				},
				{
					id: 4,
					name: 'Невозможно',
					text: 'открыть 17 слов',
					color: '#4a9efb',
					image: 'banner-4.png',
					words: 17,
					wordsLength: 7
				}
			]
		}
	}

	async startGame ({ words, wordsLength }) {
		const { openPopup } = this.props
		openPopup(<ScreenSpinner />)
		socket.emit('core/start', { words, wordsLength })
	}

	async loadBestPlayers () {
		const { playersUpdate } = this.props

		try {
			const players = await api.getBestPlayers()
			playersUpdate(players)
		} catch (e) {}
	}

	async loadPromo () {
		const { storageUpdate } = this.props
		const promo = await bridge.send('VKWebAppGetAds')
		storageUpdate({ promo });
	}

	async onUserClick (user) {
		const { showUserModal } = this.props

		const data = await api.getUserData(user.id)
		showUserModal(data)
	}

	componentDidMount () {
		this.loadBestPlayers()
		this.loadPromo()
		document.body.style.overflow = 'auto'
	}

	componentWillUnmount () {
		if (this.addScript) {
			this.addScript.outerHTML = ''
		}
	}

	render () {
		const { types, words } = this.state
		const { players, user, storage, storageUpdate, popup } = this.props

		return (
			<Panel id="main">
				<PanelHeader>Сова</PanelHeader>
				<Div style={{ marginTop: 16 }}>
					<Caption level="1"
									 weight="semibold"
									 caps
									 style={{ color: 'var(--header_text_secondary)' }}>
						Добро пожаловать в игру,
					</Caption>
					<Title level="1"
								 style={{ display: 'flex', justifyContent: 'space-between' }}
								 weight="bold">
						<span className="text-truncate">{user.first_name}</span>
						<CountUp start={words}
										 style={{ marginLeft: '10px' }}
										 end={user.words} />
					</Title>
				</Div>
				<Gallery slideWidth="90%"
								 style={{ height: 150 }}
								 slideIndex={storage.slideIndex}
								 onChange={(slideIndex) => storageUpdate({ slideIndex })}>
					{types.map((item, i) => (
						<div key={'banner_' + i}>
							<Banner mode="image"
											size="m"
											header={item.name}
											subheader={item.text}
											background={
												<div style={{
													backgroundColor: item.color,
													backgroundImage: `url(${require('../images/'+item.image)})`,
													backgroundPosition: 'right bottom',
													backgroundSize: 'contain',
													backgroundRepeat: 'no-repeat',
												}}/>
											}
											actions={
												<Button mode="overlay_primary"
																style={{ cursor: 'pointer' }}
																onClick={() => this.startGame(item)}>
													Сыграть
												</Button>
											} />
						</div>
					))}
				</Gallery>
				{storage.promo ? (
					<PromoBanner bannerData={storage.promo}
											 onClose={() => storageUpdate({ promo: undefined })} />
				) : null}
				{(players.length > 0) ? (
					<Group>
						<Header mode="secondary">Лучшие игроки</Header>
						<FlipMove>
							{players.map((user, i) => (
								<User key={user.id}
											index={i}
											onClick={() => this.onUserClick(user)}
											{...user}/>
							))}
						</FlipMove>
					</Group>
				) : null}
				<Footer>By Moorlex</Footer>
			</Panel>
		)
	}
}

class User extends Component {
	render() {
		const { name, avatar, words, index, onClick } = this.props;

		return (
			<SimpleCell description={ words + ' найденных слов'}
									onClick={onClick}
									style={{ backgroundColor: 'var(--background_content)', cursor: 'pointer' }}
									before={<Avatar src={avatar}>
										<span style={{ position: 'absolute', bottom: 0, right: 0 }}>
											{index < 3 ? (
												<Avatar style={{ background: 'var(--background_content)' }}
																size={18}
																shadow={false}>
													<IconFire style={{ color: 'var(--dynamic_red)' }}/>
												</Avatar>
											) : null}
										</span>
									</Avatar>}>
				<div style={{ display: 'flex', alignItems: 'center' }}>
					<span className="text-truncate"
								style={{ marginRight: '4px', maxWidth: '250px' }}>
						{name}
					</span>
				</div>
			</SimpleCell>
		)
	}
}

const mapStateToProps = (state) => {
	const { players, user, storage, popup } = state
	return { players, user, storage, popup }
}
export default connect(mapStateToProps, actions)(Main)
