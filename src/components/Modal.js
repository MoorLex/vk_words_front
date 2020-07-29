import React, { Component } from 'react'
import { connect } from 'react-redux'
import { platform } from '../utils'
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

  ModalInvite () {
    const { modals, closeModal } = this.props
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
                 onClose={() => closeModal()}
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
    const {  modals, closeModal } = this.props
    const extraWords = modals.data || []

    return (
      <ModalPage id="modal-words"
                 onClose={() => closeModal()}
                 header={
                   <ModalPageHeader right={<PanelHeaderButton onClick={() => closeModal()}><IconDismiss /></PanelHeaderButton>}>
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
    const { modals, closeModal } = this.props
    const { user_name, user_avatar, user_country, words, games_count, games_finished } = modals.data || {}

    return (
      <ModalCard id="modal-user"
                 onClose={() => closeModal()}
                 actionsLayout="vertical">
        <SimpleCell
          style={{ pointerEvents: 'none' }}
          description={words + ' найденных слов'}
          before={<Avatar src={user_avatar} />}
        >
          {user_name}
        </SimpleCell>
        <Group style={{ pointerEvents: 'none' }}>
          {user_country ? (
            <SimpleCell>
              <InfoRow header="Страна">{user_country}</InfoRow>
            </SimpleCell>
          ) : null}
          <SimpleCell>
            <InfoRow header="Созданных игр">{games_count}</InfoRow>
          </SimpleCell>
          <SimpleCell>
            <InfoRow header="Выигранных игр">{games_finished}</InfoRow>
          </SimpleCell>
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
