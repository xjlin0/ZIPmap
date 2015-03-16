” Use synax highlighting
syntax on

" For any filetype plugin use plugin-defined indenting
filetype plugin indent on

" Line wrap at 79
set textwidth=79

" When using > or <, for indent / outdent, go this many spaces
set shiftwidth=2

" Automatically display line numbers
set number

" Tab is never \t, but always tabstop number of spaces
set expandtab

" Tab is 2 spaces
set tabstop=2

" Allow me to change buffers without saving
set hidden

" Do not create backup files
set nobackup

" Do not create swap files
set noswapfile

" Be a good .git user
augroup gitcommit
  autocmd!
  au FileType gitcommit set tw=50
augroup END

" Reload .vimrc
nmap <Leader>s :exec "source ~/.vimrc\|echo 'Reloaded .vimrc'"<cr>

" Beautiful Magic: "jk" i insert mode returns you to Normal
inoremap jk <ESC>

" Toggle numbering modes
nnoremap <C-n><C-n> :set number! number?<CR>
nnoremap <C-n><C-r> :set relativenumber! relativenumber?<CR>
