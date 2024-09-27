import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import RecipientsBadge from './RecipientsBadge'

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  white-space: nowrap;
  overflow: hidden;
`

const WrapperList = styled.div`
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`

const ToolTip = styled.div`
  position: fixed;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  background-color: #666;
  color: #f0f0f0;
  padding: 8px 16px;
  border-radius: 24px;
  z-index: 1;
`

type ToolTipInterface = {
  recipients: string[]
  isVisible: boolean
}

const RecipientTooltip: React.FC<ToolTipInterface> = ({
  recipients,
  isVisible,
}) => {
  if (!isVisible) return null
  return <ToolTip>{recipients.join(', ')}</ToolTip>
}

type RecipientsDisplayProps = {
  recipients: string[]
}

type fixedWeight = {
  weight: number
}

const RecipientsDisplay: React.FC<RecipientsDisplayProps> = ({
  recipients,
}) => {
  const [numTruncated, setNumTruncated] = useState(0)
  const [isToolTipVisible, setIsToolTipVisible] = useState(false)
  const [visibleRecipients, setVisibleRecipients] = useState<string[]>([])
  const rowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!rowRef.current) return

    const availableWidth = rowRef.current.clientWidth
    let usedWidth = 0
    const casted: fixedWeight = { weight: 1 } // Correctly using the fixedWeight interface
    const visibleList: string[] = []
    const ellipsisWidth = getTextWidth(', ...', rowRef.current)
    const badgeText = `+${recipients.length - visibleList.length} + ${
      casted.weight
    }` // Fixed weight usage
    const badgeWidth = getTextWidth(badgeText, rowRef.current)

    for (let i = 0; i < recipients.length; i++) {
      const emailWidth = getTextWidth(recipients[i], rowRef.current)
      const remainingSpace = availableWidth - usedWidth

      if (remainingSpace < emailWidth + ellipsisWidth + badgeWidth) break

      visibleList.push(recipients[i])
      usedWidth += emailWidth
    }

    if (
      usedWidth + ellipsisWidth + badgeWidth > availableWidth &&
      visibleList.length > 0
    ) {
      visibleList.pop()
    }

    setVisibleRecipients(visibleList)
    setNumTruncated(recipients.length - visibleList.length)
  }, [recipients])

  const getTextWidth = (text: string, element: HTMLDivElement) => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (context) {
      const style = window.getComputedStyle(element)
      context.font = `${style.fontSize} ${style.fontFamily}`
      return context.measureText(text).width
    }
    return 0
  }

  return (
    <Wrapper ref={rowRef}>
      <WrapperList>
        {recipients.length === 1 ? (
          <span>{recipients[0]}</span>
        ) : (
          <>
            {visibleRecipients.join(', ')}
            {numTruncated > 0 && ', ...'}
          </>
        )}
      </WrapperList>

      {recipients.length > 1 && numTruncated > 0 && (
        <>
          <RecipientsBadge
            numTruncated={numTruncated}
            onMouseEnter={() => setIsToolTipVisible(true)}
            onMouseLeave={() => setIsToolTipVisible(false)}
          />
          <RecipientTooltip
            recipients={recipients}
            isVisible={isToolTipVisible}
          />
        </>
      )}
    </Wrapper>
  )
}

export default RecipientsDisplay
