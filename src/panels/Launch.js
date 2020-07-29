import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
	Panel,
	Placeholder,
	Gallery,
	Button
} from '@vkontakte/vkui'
import IconFireOutline from '@vkontakte/icons/dist/56/fire_outline'
import IconUserAddOutline from '@vkontakte/icons/dist/56/user_add_outline'
import IconMox from '../components/icons/mox'

export class Launch extends Component {

	constructor(props) {
		super(props)
		this.state = {
			slide: 0
		}
	}

	next () {
		const { slide } = this.state
		this.setState({ slide: slide + 1 })
	}

	render () {
		const { navigate, storage } = this.props
		const { slide } = this.state

		return (
			<Panel id="launch">
				<Gallery slideWidth="100%"
								 style={{ height: '95vh' }}
								 slideIndex={slide}
								 bullets={storage.theme === 'light' ? 'dark' : 'light'}
								 onChange={(slide) => this.setState({ slide })}>
					<div style={{ position: 'relative' }}>
						<Placeholder icon={<IconMox />}
												 header="Добро пожаловать в игру"
												 action={<Button size="l" onClick={() => this.next()}>Хорошо</Button>}
												 stretched>
							Заполняйте пустые поля и отгадывайте слова
						</Placeholder>
					</div>
					<div style={{ position: 'relative' }}>
						<Placeholder icon={<IconUserAddOutline />}
												 header="Играйте вместе"
												 action={<Button size="l" onClick={() => this.next()}>Продолжить</Button>}
												 stretched>
							Вы можете пригласить друга для совместной игры
						</Placeholder>
					</div>
					<div style={{ position: 'relative' }}>
						<Placeholder icon={<IconFireOutline />}
												 header="Будь лучшим"
												 action={<Button size="l" onClick={() => navigate('main')}>Начать</Button>}
												 stretched>
							Выиграйте уровни и получите очки за отгаданные слова
						</Placeholder>
					</div>
				</Gallery>
			</Panel>
		)
	}
}

const mapStateToProps = (state) => {
	const { storage } = state
	return { storage }
}
export default connect(mapStateToProps)(Launch)
