/**
 * Mock for next/server
 * 用於在 Jest 測試中 mock NextResponse
 */

class MockNextResponse {
    constructor(body, options = {}) {
        this._body = body
        this.status = options.status || 200
        this.statusText = options.statusText || ''
        this.ok = this.status >= 200 && this.status < 300
        this.headers = new Map(Object.entries(options.headers || {}))
    }

    async json() {
        if (!this._body) return {}
        return typeof this._body === 'string' ? JSON.parse(this._body) : this._body
    }

    async text() {
        return typeof this._body === 'string' ? this._body : JSON.stringify(this._body)
    }

    static json(data, options = {}) {
        const response = new MockNextResponse(data, options)
        return response
    }

    static redirect(url, status = 307) {
        return new MockNextResponse(null, { 
            status, 
            headers: { Location: url.toString() } 
        })
    }

    static next(options = {}) {
        return new MockNextResponse(null, { ...options, status: 200 })
    }

    static rewrite(url, options = {}) {
        return new MockNextResponse(null, { 
            ...options,
            headers: { 'x-middleware-rewrite': url.toString() } 
        })
    }
}

class MockNextRequest {
    constructor(input, init = {}) {
        if (typeof input === 'string') {
            this.url = input
        } else {
            this.url = input.url
        }
        this.method = init.method || 'GET'
        this.headers = new Map(Object.entries(init.headers || {}))
        this._body = init.body
        this.nextUrl = new URL(this.url)
        this.cookies = {
            get: (name) => init.cookies?.[name] ? { value: init.cookies[name] } : undefined,
            getAll: () => Object.entries(init.cookies || {}).map(([name, value]) => ({ name, value })),
            has: (name) => !!init.cookies?.[name],
            set: jest.fn(),
            delete: jest.fn(),
        }
    }

    async json() {
        if (!this._body) return {}
        return typeof this._body === 'string' ? JSON.parse(this._body) : this._body
    }

    async text() {
        return typeof this._body === 'string' ? this._body : JSON.stringify(this._body)
    }
}

module.exports = {
    NextResponse: MockNextResponse,
    NextRequest: MockNextRequest,
}
