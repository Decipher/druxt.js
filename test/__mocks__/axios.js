import axios from 'axios/dist/axios'
import fs from 'fs'
import md5 from 'md5'
import path from 'path'
import mockAxios from 'jest-mock-axios'

const mockData = async (url, file) => {
  let response

  // If the file isn't present, try to get it.
  if (!fs.existsSync(file)) {
    const axiosClient = axios.create({
      baseURL: 'https://demo-api.druxtjs.org'
    })
    try {
      response = await axiosClient.get(url)
      await fs.writeFileSync(file, JSON.stringify(response, null, '  '))
    } catch (err) {
      await fs.writeFileSync(file, JSON.stringify(err.response, null, '  '))
    }
    mockAxios.reset()
  }

  // If the file still isn't present, error.
  if (!fs.existsSync(file)) {
    console.warn(`Missing mock data: ${file} ${url}`)
    return { data: { file, url }, status: 404 }
  }

  response = response ? response : require(file)

  // Throw error if error data is present.
  if (response.data.errors) {
    const error = new Error
    error.response = response
    throw error
  }

  return response
}

// Mock 'get' requests.
mockAxios.get = jest.fn((url, options) => {
  if (url === '/jsonapi/missing/test') {
    throw new Error('Error')
  }
  return mockData(url, path.resolve('./test/__fixtures__/get', md5(url) + '.json'))
})

// Mock 'patch' requests.
mockAxios.patch = jest.fn((url, data, options) =>
  mockData(url, path.resolve('./test/__fixtures__/patch', md5(url), md5(JSON.stringify(data)) + '.json'))
)

// Mock 'post' requests.
mockAxios.post = jest.fn((url, data, options) =>
  mockData(url, pathe.resolve('./test/__fixtures__/post', md5(url), md5(JSON.stringify(data)) + '.json'))
)

export default mockAxios
