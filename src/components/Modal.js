import React, { Component } from 'react'
import { connect } from 'react-redux'
import { platform } from '../utils'
import moment from 'moment'
import bridge from '@vkontakte/vk-bridge'
import {
  ModalRoot,
  ModalCard,
  ModalPage,
  ModalPageHeader,
  PanelHeaderButton,
  Button,
  Placeholder,
  Avatar,
  SimpleCell,
  Group,
  InfoRow,
  Div
} from '@vkontakte/vkui'
import IconDismiss from '@vkontakte/icons/dist/24/dismiss'
import { actions } from '../store'

export class Modals extends Component {

  close () {
    const { modals } = this.props
    if (modals.timestamp + 500 <= Date.now()) {
      window.history.back()
    }
  }

  ModalInvite () {
    const { modals } = this.props
    const { qr, link } = modals.data || {}
    const actions = []

    if (platform() !== 'mobile_web') {
      actions.push({
        title: 'Поделиться ссылкой',
        mode: 'primary',
        action: () => {
          bridge.send("VKWebAppShare", { link });
        }
      })
    }

    return (
      <ModalCard id="modal-invite"
                 onClose={() => this.close()}
                 icon={<Avatar size={200}
                               mode="image"
                               shadow={false}
                               style={{ background: 'transparent' }}
                               src={qr ? `data:image/svg+xml;base64,${qr}` : undefined} />}
                 header="Играйте вместе!"
                 caption="Попросите друга отсканировать QR код"
                 actions={actions}
                 actionsLayout="vertical" />
    )
  }

  ModalWords () {
    const {  modals } = this.props
    const extraWords = modals.data || []

    return (
      <ModalPage id="modal-words"
                 onClose={() => this.close()}
                 header={
                   <ModalPageHeader right={<PanelHeaderButton onClick={() => this.close()}><IconDismiss /></PanelHeaderButton>}>
                     Дополнительные слова
                   </ModalPageHeader>
                 }>
        {extraWords.length > 0 ? (
          <Div>
            {extraWords.map((word) => (
              <Button style={{ marginRight: '10px', marginBottom: '10px', pointerEvents: 'none' }}
                      key={word}>
                {word}
              </Button>
            ))}
          </Div>
        ) : (
          <Placeholder>Список слов пуст</Placeholder>
        )}
      </ModalPage>
    )
  }

  ModalUser () {
    const { modals } = this.props
    const { user_name, user_avatar, user_country, words, total_games, finished_games, created_at } = modals.data || {}

    return (
      <ModalCard id="modal-user"
                 onClose={() => this.close()}
                 actionsLayout="vertical">
        <SimpleCell
          style={{ pointerEvents: 'none' }}
          description={words + ' найденных слов'}
          before={<Avatar src={user_avatar} />}
        >
          {user_name}
        </SimpleCell>
        <Group style={{ pointerEvents: 'none' }}>
          <div style={{ display: 'flex' }}>
            <SimpleCell style={{ flex: 1 }}>
              <InfoRow header="Дата регистрации">{moment(created_at).calendar()}</InfoRow>
            </SimpleCell>
            {user_country ? (
              <SimpleCell style={{ flex: 1 }}>
                <InfoRow header="Страна">{user_country}</InfoRow>
              </SimpleCell>
            ) : null}
          </div>
          <div style={{ display: 'flex' }}>
            <SimpleCell style={{ flex: 1 }}>
              <InfoRow header="Созданных игр">{total_games}</InfoRow>
            </SimpleCell>
            <SimpleCell style={{ flex: 1 }}>
              <InfoRow header="Выигранных игр">{finished_games}</InfoRow>
            </SimpleCell>
          </div>
        </Group>
      </ModalCard>
    )
  }

  render () {
    const { modals } = this.props
    return (
      <ModalRoot activeModal={modals.active}
                 onClose={() => this.onClose()}>
        {this.ModalWords()}
        {this.ModalInvite()}
        {this.ModalUser()}
      </ModalRoot>
    )
  }
}

const mapStateToProps = (state) => {
  const { modals } = state
  return { modals }
}
export default connect(mapStateToProps, actions)(Modals)
