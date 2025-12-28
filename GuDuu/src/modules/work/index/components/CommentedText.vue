<template>
  <div class="code-container flex font-fira_retina text-menu-text">
    <div class="line-numbers lg:flex flex-col w-32 hidden">

      <!-- line numbers and asteriscs -->
      <div v-for="n in lines" class="grid grid-cols-2 justify-end" :key="n">
        <span class="col-span-1 mr-3">{{ n }}</span>
        <div v-if="n == 1" class="col-span-1 flex justify-center">/**</div>
        <div class="col-span-1 flex justify-center" v-if="n > 1 && n < lines">*</div>
        <div class="col-span-1 flex justify-center pl-2" v-if="n == lines">*/</div>
      </div>
    </div>

    <!-- text -->
    <div class="text-container">
      <p><span style="color:#505BC7;">You can <span style="color:#72D6B0;">type what you want to say</span> in the <span style="color:#72D6B0;">blank space below</span>, and <span style="color:#9B6F6B;">“we will <span style="color:#72D6B0;">anonymously post</span> it to social media platforms”</span></span><p><br /></p><p @keydown="updateLines" v-html="content" contenteditable="true"  @input="handleInput" @click="handleClick" @blur="handleBlur" id="editableDiv" ref="editableDiv" style="word-wrap: break-word !important;white-space: normal;overflow-wrap: break-word;"></p></p>
    </div>

  </div>
</template>

<script>

export default {
  props: {
    text: {
      type: String,
      required: true
    },
    type:{
      type: String,
      required: true
    },
    textChange:{
      type:Function,
      required: true
    }
  },
  data() {
    return {
      lines: 0,
      placeholderText:{
        experience:`Here, you can anonymously share your confessions with God. Speak your heart out and let your soul find peace and comfort.
Rest assured, we do not record any personal information. Your confession is between you and God alone.<br>
-----------------------------------------------<br>
Example:

God, I’m sorry. Over the past six months, I’ve been so busy with work that I kept hanging up on my mom’s calls, thinking, “I’ll talk to her when I have time.” A few days ago, I couldn’t reach her, and I found out she was hospitalized. My heart is filled with guilt and regret. Why do I always put the most important people last?
If you can hear my prayers, please bless my mom with good health. I promise to change and never take her love and care for granted again.`,
        "hard-skills":`Here, you can anonymously share your wishes and dreams with God. Let your heart speak freely, and believe in the power of hope and faith.
Rest assured, we do not record any personal information. Your wishes remain between you and God.<br>
-----------------------------------------------<br>
Example:

Dear God, I wish for strength and courage to face the challenges ahead. Life has been overwhelming lately, and I sometimes feel lost and powerless. Please guide me toward clarity and peace, and grant me the patience to overcome these struggles.
I also wish for the health and happiness of my family. May we always stay united and strong.`,
        "soft-skills":`Write a message, release it into the sea of anonymity, and let it find its way to someone who needs it—or someone who can understand. Whether it’s a thought, a secret, or a question, let it drift and connect.
Your identity is secure. This is your chance to freely express yourself.<br>
-----------------------------------------------<br>
Example:

To the me five years from now,
Are you happy? Did you achieve the dreams we talked about? I hope you’ve found peace with the choices we made and the ones we had to let go of.
Life is tough now, but I’m trying my best to make you proud. If you’re reading this, please remember how far we’ve come and never stop believing in yourself.`
      },
      content:'',
      content2:'',
    };
  },
  mounted() {
    this.updateLines();
    window.addEventListener("resize", this.updateLines);
    window.addEventListener("click", this.updateLines);
    //this.focusEditableDiv();
    this.content=this.placeholderText[this.type];
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.updateLines);
    window.removeEventListener("click", this.updateLines);
  },
  methods: {
    handleClick(){
      if(this.content===this.placeholderText[this.type]){
        this.content='';
      }
    },
    handleBlur(){
      if(this.content2===''){
        this.content=this.placeholderText[this.type];
      }
    },
    focusEditableDiv() {
      const editableDiv = this.$refs.editableDiv;
      if (editableDiv) {
       editableDiv.focus();
      }
    },
    updateLines() {
      const textContainer = this.$el.querySelector(".text-container");
      const style = window.getComputedStyle(textContainer);
      const fontSize = parseInt(style.fontSize);
      const lineHeight = parseInt(style.lineHeight);
      const maxHeight = textContainer.offsetHeight;
      this.lines = Math.ceil(maxHeight / lineHeight) + 1;
    },
    handleInput(e){
      const textContainer = document.getElementById('editableDiv');
      const currentText = textContainer.textContent;
      const maxChars=10000;
      const trimmedText = currentText.slice(0, maxChars);
      if (currentText.length > maxChars) {
        textContainer.textContent = trimmedText;
      }
      this.content2=currentText;

      this.textChange(trimmedText);
      this.restoreCursor(textContainer, maxChars);
    },
    restoreCursor(element, maxLength) {
      const selection = window.getSelection();
      const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : document.createRange();
      range.setStart(element.firstChild, maxLength);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
};
</script>

<style scoped>
.code-container {
  display: flex;
  align-items: flex-start;
}

.line-numbers {
  text-align: right;
}

.text-container {
  width: 100%;
  padding-left: 10px;
  word-wrap: break-word;
}

[contenteditable="true"] {
    outline: none; /* 隐藏获得焦点时的边框 */
    border: none;  /* 隐藏边框 */
}
</style>
