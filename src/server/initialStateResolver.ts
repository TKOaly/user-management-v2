import { getMe, searchUsers, getUserPayment } from '../services/tkoUserService'
import { AppProps } from '../features/App'
import { Maybe, Just } from 'purify-ts'

const getUserList = (token: Maybe<string>) =>
  searchUsers('', token).then(({ payload }) => payload)

export const resolveInitialState = async (
  token: Maybe<string>,
  path: string,
  editUserId: Maybe<string>
): Promise<AppProps> => {
  const me = await getMe(token).then(({ payload }) => payload)
  if (!me)
    return {
      user: null,
      userSearchState: [],
      navigation: {
        path,
      },
      userEditState: {
        editUser: null,
      },
    }

  const userList = me.role !== 'kayttaja' ? await getUserList(token) : []
  const editUser = editUserId.chain(id =>
    id === 'me'
      ? Just(me)
      : Maybe.fromNullable(userList.find(u => u.id === Number(id)))
  )

  const userPayment = editUser.map(
    async usr =>
      await getUserPayment(usr.id, token).then(({ payload }) => payload)
  )

  return {
    user: me,
    userSearchState: userList,
    navigation: {
      path,
    },
    userEditState: {
      editUser: await editUser
        .map(async user => ({
          ...user,
          payment: await userPayment.extract(),
        }))
        .orDefault(Promise.resolve(null)),
    },
  }
}
