/**
 * Loading 組件測試
 * 簡單的組件測試範例
 */

import { render, screen } from '@testing-library/react'
import Loading from '@/components/Loading'

describe('Loading Component', () => {
    it('應該正確渲染 loading spinner', () => {
        render(<Loading />)
        
        // 檢查 spinner 元素存在
        const spinner = document.querySelector('.animate-spin')
        expect(spinner).toBeInTheDocument()
    })

    it('應該有正確的 CSS classes', () => {
        const { container } = render(<Loading />)
        
        // 檢查容器有 flex 和 center 樣式
        const wrapper = container.firstChild
        expect(wrapper).toHaveClass('flex')
        expect(wrapper).toHaveClass('items-center')
        expect(wrapper).toHaveClass('justify-center')
    })
})
