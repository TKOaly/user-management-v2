import { getMe, searchUsers, getUserPayment } from '../services/tkoUserService'
import { AppProps } from '../features/App'

const getUserList = (token: string) =>
  searchUsers('', token)
    .then(({ payload }) => payload)

export const resolveInitialState = async (token: string, path: string, editUserId?: string): Promise<AppProps> => {
  const me = await getMe(token).then(({ payload }) => payload)
  const userList = me.role !== 'kayttaja' ? await getUserList(token) : []
  const resolvedUserId = editUserId === 'me' ? me.id : Number(editUserId)
  const editUser = editUserId ? userList.find(u => u.id === resolvedUserId) : null
  const userPayment = 
    editUserId ?
    await getUserPayment(editUser.id, token).then(({ payload }) => payload) :
    null
  console.log(editUser, editUserId, resolvedUserId)
  return {
    user: me,
    userSearchState: {
      users: userList
    },
    navigation: {
      path
    },
    userEditState: {
      editUser: editUser ? {
        ...editUser,
        payment: userPayment
      } : null
    }
  }
}