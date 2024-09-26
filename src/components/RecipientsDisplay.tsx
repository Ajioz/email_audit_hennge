import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import RecipientsBadge from './RecipientsBadge'

const RecipientsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  white-space: nowrap;
  overflow: hidden;
`

const RecipientsListWrapper = styled.div`
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`

const TooltipWrapper = styled.div`
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

export const RecipientTooltip: React.FC<ToolTipInterface> = ({
  recipients,
  isVisible,
}) => {
  if (!isVisible) return null
  return <TooltipWrapper>{recipients.join(', ')}</TooltipWrapper>
}

type RecipientsDisplayProps = {
  recipients: string[]
}

const RecipientsDisplay: React.FC<RecipientsDisplayProps> = ({
  recipients,
}) => {
  const [numTruncated, setNumTruncated] = useState(0)
  const [toolTip, setToolTip] = useState(false)
  const [visibleRecipients, setVisibleRecipients] = useState<string[]>([])
  const rowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!rowRef.current) return
    const available_width = rowRef.current.clientWidth
    let occupied_width = 0
    let newVisibleRecipients: string[] = []
    const ellipsis_length = checkText_width(', ...', rowRef.current)
    const badgeText = `+${recipients.length - newVisibleRecipients.length}`
    const badgeWidth = checkText_width(badgeText, rowRef.current)

    let stopLoop = false // Flag to control the loop

    recipients.forEach((email, i) => {
      if (stopLoop) return // Exit if the flag is set
      if (!rowRef.current) return // Exit if rowRef.current is null
      const emailWidth = checkText_width(email, rowRef.current)
      const spaceLeft = available_width - occupied_width

      if (
        i === recipients.length - 1 ||
        spaceLeft < emailWidth + ellipsis_length + badgeWidth
      ) {
        stopLoop = true // Set the flag to stop further processing
        return // Exit the current iteration
      }

      newVisibleRecipients.push(email)
      occupied_width += emailWidth
    })

    /**
     *  for (let i = 0; i < recipients.length; i++) {
      const email = recipients[i]
      const emailWidth = checkText_width(email, rowRef.current)
      const spaceLeft = available_width - occupied_width

      if (
        i === recipients.length - 1 ||
        spaceLeft < emailWidth + ellipsis_length + badgeWidth
      ) {
        break
      }

      newVisibleRecipients.push(email)
      occupied_width += emailWidth
    }
     */

    const totalWidthWithEllipsisAndBadge =
      occupied_width + ellipsis_length + badgeWidth

    if (
      totalWidthWithEllipsisAndBadge > available_width &&
      newVisibleRecipients.length > 0
    ) {
      newVisibleRecipients.pop()
    }

    const hiddenCount = recipients.length - newVisibleRecipients.length
    setVisibleRecipients(newVisibleRecipients)
    setNumTruncated(hiddenCount)
  }, [recipients])

  const checkText_width = (text: string, element: HTMLDivElement) => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    const style = window.getComputedStyle(element)
    if (context && style) {
      context.font = `${style.fontSize} ${style.fontFamily}`
      return context.measureText(text).width
    }
    return 0
  }

  return (
    <RecipientsWrapper ref={rowRef}>
      <RecipientsListWrapper>
        {recipients.length === 1 ? (
          <span>{recipients[0]}</span>
        ) : (
          <>
            {visibleRecipients.join(', ')}
            {numTruncated > 0 && ', ...'}
          </>
        )}
      </RecipientsListWrapper>

      {recipients.length > 1 && numTruncated > 0 && (
        <>
          <RecipientsBadge
            numTruncated={numTruncated}
            onMouseEnter={() => setToolTip(true)}
            onMouseLeave={() => setToolTip(false)}
          />
          <RecipientTooltip recipients={recipients} isVisible={toolTip} />
        </>
      )}
    </RecipientsWrapper>
  )
}

export default RecipientsDisplay
