import { getMe, searchUsers, getUserPayment, Payment } from '../services/tkoUserService'
import { AppProps } from '../features/App'
import { Option, map, getOrElse, some, chain, fromNullable } from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'

const getUserList = (token: Option<string>) =>
  searchUsers('', token).then(({ payload }) => payload)

export const resolveInitialState = async (
  token: Option<string>,
  path: string,
  editUserId: Option<string>
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
  const editUser =
    pipe(
      editUserId,
      chain(id =>
        id === 'me'
        ? some(me)
        : fromNullable(userList.find(u => u.id === Number(id))))
    )

  const userPayment =
    pipe(
      editUser,
      map(async usr => await getUserPayment(usr.id, token).then(({ payload }) => payload))
    )

  return {
    user: me,
    userSearchState: userList,
    navigation: {
      path,
    },
    userEditState: {
      editUser: await pipe(
        editUser,
        map(async user => ({
          ...user,
          payment: await getOrElse<Promise<Payment>>(
            () => Promise.resolve(null))(userPayment),
        })),
        getOrElse(() => Promise.resolve(null))
      )
    },
  }
}
