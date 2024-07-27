export const base_url = "URL"

endpoint = "usuarios"

export const getUser = async(idUser) => {
    await axios.get(`${base_url}+${endpoint}/myprofile/${idUser}`)
}

export const getAllUsers = async(idUser) => {
    await axios.get(`${base_url}+${endpoint}/users`)
}